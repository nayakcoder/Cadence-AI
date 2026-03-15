import Anthropic from "@anthropic-ai/sdk";
import { Channel, TonePreference } from "@prisma/client";
import { buildCopyGenerationPrompt } from "@/lib/prompts/copy-generation";
import { buildReplyClassificationPrompt, ReplyClassificationInput } from "@/lib/prompts/reply-classification";
import { prisma } from "@/lib/prisma";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = "claude-3-5-sonnet-20241022";
const INPUT_COST_PER_TOKEN = 0.000003; // $3 per 1M tokens
const OUTPUT_COST_PER_TOKEN = 0.000015; // $15 per 1M tokens

async function logUsage(
  orgId: string,
  service: string,
  inputTokens: number,
  outputTokens: number
) {
  const estimatedCost =
    inputTokens * INPUT_COST_PER_TOKEN + outputTokens * OUTPUT_COST_PER_TOKEN;
  await prisma.apiUsageLog.create({
    data: {
      orgId,
      service,
      model: MODEL,
      inputTokens,
      outputTokens,
      estimatedCost,
    },
  });
}

export interface GenerateCopyInput {
  orgId: string;
  icp: {
    targetTitles: string[];
    targetIndustries: string[];
    painPoints: string;
    valueProps: string;
    tonePreference: TonePreference;
  };
  lead: {
    firstName: string;
    lastName: string;
    title?: string;
    company?: string;
    enrichmentData?: Record<string, any>;
  };
  channel: Channel;
  stepNumber: number;
  priorConversation?: string;
  feedbackNote?: string;
}

export interface GeneratedCopy {
  connectionNote?: string;
  openingDM?: string;
  openingEmail?: string;
  subjectLine?: string;
  followUp1?: string;
  followUp2?: string;
  breakupMessage?: string;
  dmMessage?: string;
  commentReply?: string;
}

export const AIService = {
  async generateCopy(input: GenerateCopyInput): Promise<GeneratedCopy> {
    const prompt = buildCopyGenerationPrompt(input);
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });
    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type from Claude");
    await logUsage(
      input.orgId,
      "copy-generation",
      response.usage.input_tokens,
      response.usage.output_tokens
    );
    try {
      return JSON.parse(content.text) as GeneratedCopy;
    } catch {
      throw new Error(`Failed to parse Claude response: ${content.text}`);
    }
  },

  async classifyReply(
    orgId: string,
    input: ReplyClassificationInput
  ): Promise<{
    classification: string;
    confidence: number;
    reasoning: string;
    suggestedResponse: string | null;
    leadScoreAdjustment: number;
  }> {
    const prompt = buildReplyClassificationPrompt(input);
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });
    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type from Claude");
    await logUsage(
      orgId,
      "reply-classification",
      response.usage.input_tokens,
      response.usage.output_tokens
    );
    try {
      return JSON.parse(content.text);
    } catch {
      throw new Error(`Failed to parse Claude reply classification: ${content.text}`);
    }
  },

  async generateOnboardingCampaignDraft(
    orgId: string,
    companyDescription: string,
    icp: {
      targetTitles: string[];
      targetIndustries: string[];
      painPoints: string;
      valueProps: string;
    },
    channels: Channel[]
  ): Promise<{ campaignName: string; description: string }> {
    const prompt = `You are a B2B sales campaign strategist. Based on the following company and ICP information, suggest a campaign name and brief description.

Company Description: ${companyDescription}
Target Titles: ${icp.targetTitles.join(", ")}
Target Industries: ${icp.targetIndustries.join(", ")}
Pain Points: ${icp.painPoints}
Value Props: ${icp.valueProps}
Channels: ${channels.join(", ")}

Return a JSON object with:
{
  "campaignName": "...",
  "description": "..."
}

Return ONLY valid JSON.`;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });
    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");
    await logUsage(
      orgId,
      "campaign-draft-generation",
      response.usage.input_tokens,
      response.usage.output_tokens
    );
    return JSON.parse(content.text);
  },
};

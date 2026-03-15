import { TonePreference, Channel } from "@prisma/client";

interface ICPContext {
  targetTitles: string[];
  targetIndustries: string[];
  painPoints: string;
  valueProps: string;
  tonePreference: TonePreference;
}

interface LeadContext {
  firstName: string;
  lastName: string;
  title?: string;
  company?: string;
  enrichmentData?: Record<string, any>;
}

interface CopyGenerationInput {
  icp: ICPContext;
  lead: LeadContext;
  channel: Channel;
  stepNumber: number;
  priorConversation?: string;
  feedbackNote?: string;
}

const TONE_INSTRUCTIONS: Record<TonePreference, string> = {
  PROFESSIONAL: "Maintain a formal, executive-level tone. Be direct and respectful.",
  CASUAL: "Use a friendly, conversational tone. Be approachable and genuine.",
  AGGRESSIVE: "Be bold and direct. Lead with urgency and strong value statements.",
};

const STEP_CONTEXT: Record<number, string> = {
  1: "This is the FIRST TOUCH — introduce yourself briefly and lead with value. Do not oversell.",
  2: "This is FOLLOW-UP 1 — reference the previous message and add a new data point or insight.",
  3: "This is FOLLOW-UP 2 — try a different angle. Lead with a question or share a relevant case study.",
  4: "This is the BREAKUP MESSAGE — keep it short, genuine, and leave the door open for future contact.",
};

export function buildCopyGenerationPrompt(input: CopyGenerationInput): string {
  const { icp, lead, channel, stepNumber, priorConversation, feedbackNote } = input;
  const toneInstruction = TONE_INSTRUCTIONS[icp.tonePreference] || TONE_INSTRUCTIONS.PROFESSIONAL;
  const stepInstruction = STEP_CONTEXT[stepNumber] || STEP_CONTEXT[1];
  const enrichment = lead.enrichmentData ? JSON.stringify(lead.enrichmentData, null, 2) : "No enrichment data available.";

  const channelConstraints: Record<Channel, string> = {
    LINKEDIN: `LinkedIn constraints:
- Connection request note: MAX 300 characters (hard limit)
- DM message: MAX 500 characters
- Keep it conversational and personal`,
    EMAIL: `Email constraints:
- Subject line: Under 50 characters, avoid spam trigger words
- Body: 100-200 words max
- Include a clear single call-to-action`,
    REDDIT: `Reddit constraints:
- Must feel organic and helpful, NOT like a sales pitch
- Reference their specific post or comment naturally
- Max 150 words`,
  };

  const outputFormat: Record<Channel, string> = {
    LINKEDIN: `Return a JSON object with exactly these keys:
{
  "connectionNote": "...", // under 300 chars
  "openingDM": "...",
  "followUp1": "...",
  "followUp2": "...",
  "breakupMessage": "..."
}`,
    EMAIL: `Return a JSON object with exactly these keys:
{
  "subjectLine": "...",
  "openingEmail": "...",
  "followUp1": "...",
  "followUp2": "...",
  "breakupMessage": "..."
}`,
    REDDIT: `Return a JSON object with exactly these keys:
{
  "dmMessage": "...",
  "commentReply": "..."
}`,
  };

  return `You are an expert B2B sales copywriter for a company using AI-powered outreach. Generate highly personalized, conversion-optimized outreach copy.

## TARGET LEAD
- Name: ${lead.firstName} ${lead.lastName}
- Title: ${lead.title || "Unknown"}
- Company: ${lead.company || "Unknown"}
- Enrichment Data: ${enrichment}

## CLIENT ICP & CONTEXT
- Target Titles: ${icp.targetTitles.join(", ")}
- Target Industries: ${icp.targetIndustries.join(", ")}
- Pain Points to Address: ${icp.painPoints}
- Value Proposition: ${icp.valueProps}
- Tone Preference: ${icp.tonePreference}

## TONE INSTRUCTION
${toneInstruction}

## SEQUENCE CONTEXT
Step ${stepNumber}: ${stepInstruction}

## CHANNEL
${channel} — ${channelConstraints[channel]}

${priorConversation ? `## PRIOR CONVERSATION HISTORY\n${priorConversation}\n` : ""}

${feedbackNote ? `## REGENERATION FEEDBACK (incorporate this)\n${feedbackNote}\n` : ""}

## STRICT RULES
1. NEVER mention competitor companies
2. NEVER use clichés like "hope this finds you well", "I wanted to reach out", "touching base", "circle back", "synergy", "leverage", "paradigm shift"
3. ALWAYS end with ONE clear call-to-action
4. Reference the lead's specific title, company, or industry naturally
5. Make it sound human-written, not AI-generated
6. Never be overly salesy or pushy — lead with genuine value
7. If this is a LinkedIn connection note, it MUST be under 300 characters

${outputFormat[channel]}

Return ONLY valid JSON, no markdown formatting, no explanation.`;
}

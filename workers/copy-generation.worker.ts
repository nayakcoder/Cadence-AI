import { Worker, Job } from "bullmq";
import { prisma } from "../lib/prisma";
import { AIService } from "../lib/services/ai.service";
import { redisConnection as connection } from "../lib/redis";

interface CopyGenerationJob {
  campaignId: string;
  leadId: string;
  stepNumber: number;
  channel: "LINKEDIN" | "EMAIL" | "REDDIT";
}

const worker = new Worker<CopyGenerationJob>(
  "copy-generation",
  async (job: Job<CopyGenerationJob>) => {
    const { campaignId, leadId, stepNumber, channel } = job.data;

    const [campaign, lead] = await Promise.all([
      prisma.campaign.findUnique({
        where: { id: campaignId },
        include: { org: { include: { icps: { take: 1 } } } },
      }),
      prisma.lead.findUnique({ where: { id: leadId } }),
    ]);

    if (!campaign || !lead) throw new Error("Campaign or lead not found");
    const icp = campaign.org.icps[0];
    if (!icp) throw new Error("No ICP configured for org");

    const copy = await AIService.generateCopy({
      orgId: campaign.orgId,
      icp: {
        targetTitles: icp.targetTitles,
        targetIndustries: icp.targetIndustries,
        painPoints: icp.painPoints,
        valueProps: icp.valueProps,
        tonePreference: icp.tonePreference,
      },
      lead: {
        firstName: lead.firstName,
        lastName: lead.lastName,
        title: lead.title || undefined,
        company: lead.company || undefined,
        enrichmentData: lead.enrichmentData as any,
      },
      channel,
      stepNumber,
    });

    // Find or create the sequence step and update body template
    const existingStep = await prisma.touchSequence.findFirst({
      where: { campaignId, stepNumber, channel },
    });

    if (existingStep) {
      let body = "";
      if (channel === "EMAIL") body = copy.openingEmail || copy.followUp1 || copy.followUp2 || "";
      else if (channel === "LINKEDIN") body = copy.connectionNote || copy.openingDM || "";
      else if (channel === "REDDIT") body = copy.dmMessage || "";

      await prisma.touchSequence.update({
        where: { id: existingStep.id },
        data: {
          bodyTemplate: body,
          subjectLine: channel === "EMAIL" ? (copy.subjectLine || undefined) : undefined,
          aiGenerated: true,
        },
      });
    }

    console.log(`✅ Copy generated for lead ${leadId}, step ${stepNumber}, channel ${channel}`);
  },
  { connection, concurrency: 3 }
);

worker.on("failed", (job, err) => {
  console.error(`❌ Copy generation job failed:`, err.message);
});

export default worker;
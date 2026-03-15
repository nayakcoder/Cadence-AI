import { Worker, Job } from "bullmq";
import { prisma } from "../lib/prisma";
import { queues } from "../lib/queue/queues";

const redisUrl = new URL(process.env.REDIS_URL || "redis://localhost:6379");
const connection = {
  host: redisUrl.hostname,
  port: parseInt(redisUrl.port) || 6379,
  password: redisUrl.password || undefined,
  maxRetriesPerRequest: null as null,
};

interface LeadEnrichmentJob {
  leadId: string;
  campaignId: string;
}

const worker = new Worker<LeadEnrichmentJob>(
  "lead-enrichment",
  async (job: Job<LeadEnrichmentJob>) => {
    const { leadId, campaignId } = job.data;

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new Error(`Lead not found: ${leadId}`);

    // Placeholder enrichment — in production, integrate with Apollo.io, Hunter.io, etc.
    const enrichmentData = {
      enrichedAt: new Date().toISOString(),
      source: "placeholder",
      linkedinVerified: !!lead.linkedinUrl,
      emailVerified: !!lead.email,
    };

    await prisma.lead.update({
      where: { id: leadId },
      data: { enrichmentData },
    });

    // Queue copy generation for this lead
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { sequences: { take: 1, orderBy: { stepNumber: "asc" } } },
    });

    if (campaign?.sequences[0]) {
      await queues.copyGeneration.add("generate-copy", {
        campaignId,
        leadId,
        stepNumber: 1,
        channel: campaign.sequences[0].channel,
      });
    }

    console.log(`✅ Lead ${leadId} enriched`);
  },
  { connection, concurrency: 10 }
);

worker.on("failed", (job, err) => {
  console.error(`❌ Enrichment job ${job?.id} failed:`, err.message);
});

export default worker;

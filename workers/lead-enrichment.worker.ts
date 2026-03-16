import { Worker, Job } from "bullmq";
import { prisma } from "../lib/prisma";
import { queues } from "../lib/queue/queues";
import { redisConnection as connection } from "../lib/redis";

interface LeadEnrichmentJob {
  leadId: string;
  campaignId: string;
}

const worker = new Worker<LeadEnrichmentJob>(
  "lead-enrichment",
  async (job: Job<LeadEnrichmentJob>) => {
    const { leadId, campaignId } = job.data;

    // Fetch the lead and its campaign's first sequence step in a single query
    // to avoid a second round-trip after enrichment.
    const [lead, campaign] = await Promise.all([
      prisma.lead.findUnique({
        where: { id: leadId },
        select: { id: true, linkedinUrl: true, email: true },
      }),
      prisma.campaign.findUnique({
        where: { id: campaignId },
        select: {
          sequences: { take: 1, orderBy: { stepNumber: "asc" }, select: { channel: true } },
        },
      }),
    ]);

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
import { Worker, Job } from "bullmq";
import { prisma } from "../lib/prisma";
import { LinkedInService } from "../lib/integrations/linkedin";

const redisUrl = new URL(process.env.REDIS_URL || "redis://localhost:6379");
const connection = {
  host: redisUrl.hostname,
  port: parseInt(redisUrl.port) || 6379,
  password: redisUrl.password || undefined,
  maxRetriesPerRequest: null as null,
};

interface LinkedInJob {
  leadId: string;
  sequenceStepId: string;
  touchLogId: string;
  type: "connection_request" | "dm";
}

const MAX_DAILY_CONNECTIONS = 20;
const MAX_DAILY_DMS = 30;

const worker = new Worker<LinkedInJob>(
  "linkedin-outreach",
  async (job: Job<LinkedInJob>) => {
    const { leadId, sequenceStepId, touchLogId, type } = job.data;

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { campaign: { include: { org: true } } },
    });
    const step = await prisma.touchSequence.findUnique({ where: { id: sequenceStepId } });

    if (!lead?.linkedinUrl || !step) {
      throw new Error(`Lead has no LinkedIn URL or step not found: ${leadId}`);
    }

    // Safety governor: check daily limits
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLinkedIn = await prisma.touchLog.count({
      where: {
        lead: { campaign: { orgId: lead.campaign.orgId } },
        sentAt: { gte: today },
        sequenceStep: { channel: "LINKEDIN" },
      },
    });

    const limit = type === "connection_request" ? MAX_DAILY_CONNECTIONS : MAX_DAILY_DMS;
    if (todayLinkedIn >= limit) {
      throw new Error(`Daily LinkedIn ${type} limit reached`);
    }

    if (type === "connection_request") {
      const note = step.bodyTemplate.slice(0, 300); // Enforce 300 char limit
      await LinkedInService.sendConnectionRequest(lead.linkedinUrl, note);
    } else {
      await LinkedInService.sendDM(lead.linkedinUrl, step.bodyTemplate);
    }

    await prisma.touchLog.update({
      where: { id: touchLogId },
      data: { sentAt: new Date() },
    });

    console.log(`✅ LinkedIn ${type} sent to ${lead.linkedinUrl}`);
  },
  { connection, concurrency: 2 }
);

worker.on("failed", async (job, err) => {
  console.error(`❌ LinkedIn job ${job?.id} failed:`, err.message);
  await prisma.webhookEvent.create({
    data: {
      source: "linkedin-worker",
      payload: { jobId: job?.id, error: err.message, data: job?.data as any },
    },
  });
});

export default worker;

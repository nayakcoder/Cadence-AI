import { Worker, Job } from "bullmq";
import { prisma } from "../lib/prisma";
import { RedditService } from "../lib/integrations/reddit";
import { redisConnection as connection } from "../lib/redis";

interface RedditOutreachJob {
  leadId: string;
  sequenceStepId: string;
  touchLogId: string;
}

const worker = new Worker<RedditOutreachJob>(
  "reddit-outreach",
  async (job: Job<RedditOutreachJob>) => {
    const { leadId, sequenceStepId, touchLogId } = job.data;

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    const step = await prisma.touchSequence.findUnique({ where: { id: sequenceStepId } });

    if (!lead?.redditUsername || !step) {
      throw new Error("Lead has no Reddit username or step not found");
    }

    // Reddit DMs require account manager approval - just log and pause for review
    await prisma.touchLog.update({
      where: { id: touchLogId },
      data: { sentAt: null }, // Will be sent after AM approval
    });

    // Create a pending approval webhook event
    await prisma.webhookEvent.create({
      data: {
        source: "reddit-outreach-pending",
        payload: {
          leadId,
          username: lead.redditUsername,
          message: step.bodyTemplate,
          touchLogId,
          status: "PENDING_APPROVAL",
        },
      },
    });

    console.log(`⏳ Reddit outreach for u/${lead.redditUsername} queued for AM approval`);
  },
  { connection }
);

export default worker;
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

interface FollowUpSchedulerJob {
  type: "check-all";
}

const worker = new Worker<FollowUpSchedulerJob>(
  "follow-up-scheduler",
  async (job: Job<FollowUpSchedulerJob>) => {
    // Get all active campaigns
    const activeCampaigns = await prisma.campaign.findMany({
      where: { status: "ACTIVE" },
      include: {
        sequences: { orderBy: { stepNumber: "asc" } },
        leads: {
          where: { status: { notIn: ["UNSUBSCRIBED", "BOOKED"] } },
          include: {
            touchLogs: {
              take: 1,
              orderBy: { createdAt: "desc" as const },
              include: { sequenceStep: true },
            },
          },
        },
      },
    });

    let scheduled = 0;
    for (const campaign of activeCampaigns) {
      for (const lead of campaign.leads) {
        const lastLog = lead.touchLogs[0];
        const lastStepNumber = lastLog?.sequenceStep?.stepNumber ?? 0;

        // Find next step
        const nextStep = campaign.sequences.find(
          (s) => s.stepNumber === lastStepNumber + 1
        );
        if (!nextStep) continue;

        // Check if enough days have passed
        const daysSinceLastTouch = lastLog?.sentAt
          ? (Date.now() - lastLog.sentAt.getTime()) / (1000 * 60 * 60 * 24)
          : Infinity;

        if (daysSinceLastTouch >= nextStep.delayDays) {
          // Create a touch log entry
          const touchLog = await prisma.touchLog.create({
            data: {
              leadId: lead.id,
              sequenceStepId: nextStep.id,
            },
          });

          // Queue the appropriate outreach job
          const jobData = {
            leadId: lead.id,
            sequenceStepId: nextStep.id,
            touchLogId: touchLog.id,
          };

          if (nextStep.channel === "EMAIL") {
            await queues.emailDispatch.add("send-email", jobData);
          } else if (nextStep.channel === "LINKEDIN") {
            await queues.linkedinOutreach.add("send-linkedin", {
              ...jobData,
              type: lastStepNumber === 0 ? "connection_request" : "dm",
            });
          } else if (nextStep.channel === "REDDIT") {
            await queues.redditOutreach.add("send-reddit", jobData);
          }
          scheduled++;
        }
      }
    }
    console.log(`✅ Follow-up scheduler: ${scheduled} touches queued`);
  },
  { connection }
);

worker.on("failed", (job, err) => {
  console.error(`❌ Follow-up scheduler job failed:`, err.message);
});

export default worker;

import { Worker, Job } from "bullmq";
import { prisma } from "../lib/prisma";
import { queues } from "../lib/queue/queues";
import { redisConnection as connection } from "../lib/redis";

interface FollowUpSchedulerJob {
  type: "check-all";
}

/** Number of leads processed per database page to avoid OOM on large datasets. */
const PAGE_SIZE = 100;

const worker = new Worker<FollowUpSchedulerJob>(
  "follow-up-scheduler",
  async (job: Job<FollowUpSchedulerJob>) => {
    let scheduled = 0;
    let cursor: string | undefined;

    // Fetch active campaign IDs once – these are small and unlikely to change
    // within a single scheduler run.
    const activeCampaignIds = await prisma.campaign
      .findMany({ where: { status: "ACTIVE" }, select: { id: true } })
      .then((rows) => rows.map((r) => r.id));

    if (activeCampaignIds.length === 0) {
      console.log("✅ Follow-up scheduler: no active campaigns");
      return;
    }

    // Load sequence steps for all active campaigns in one query so we don't
    // re-fetch them for every page of leads.
    const sequences = await prisma.touchSequence.findMany({
      where: { campaignId: { in: activeCampaignIds } },
      orderBy: { stepNumber: "asc" },
    });
    const sequencesByCampaign = sequences.reduce<
      Record<string, typeof sequences>
    >((acc, s) => {
      (acc[s.campaignId] ??= []).push(s);
      return acc;
    }, {});

    // Iterate over eligible leads page-by-page using cursor pagination so
    // the scheduler never loads the entire leads table into memory at once.
    do {
      const leads = await prisma.lead.findMany({
        where: {
          campaignId: { in: activeCampaignIds },
          status: { notIn: ["UNSUBSCRIBED", "BOOKED"] },
        },
        select: {
          id: true,
          campaignId: true,
          touchLogs: {
            take: 1,
            orderBy: { createdAt: "desc" },
            select: {
              sentAt: true,
              sequenceStep: { select: { stepNumber: true } },
            },
          },
        },
        take: PAGE_SIZE,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { id: "asc" },
      });

      if (leads.length === 0) break;
      cursor = leads[leads.length - 1].id;

      // Collect all TouchLog inserts for this page and execute them together
      const newLogs: Array<{ leadId: string; sequenceStepId: string }> = [];
      type Pending = { leadIndex: number; nextStep: (typeof sequences)[0]; lastStepNumber: number };
      const pending: Pending[] = [];

      for (let i = 0; i < leads.length; i++) {
        const lead = leads[i];
        const lastLog = lead.touchLogs[0];
        const lastStepNumber = lastLog?.sequenceStep?.stepNumber ?? 0;

        const campaignSeqs = sequencesByCampaign[lead.campaignId] ?? [];
        const nextStep = campaignSeqs.find((s) => s.stepNumber === lastStepNumber + 1);
        if (!nextStep) continue;

        const daysSinceLastTouch = lastLog?.sentAt
          ? (Date.now() - lastLog.sentAt.getTime()) / (1000 * 60 * 60 * 24)
          : Infinity;

        if (daysSinceLastTouch >= nextStep.delayDays) {
          newLogs.push({ leadId: lead.id, sequenceStepId: nextStep.id });
          pending.push({ leadIndex: i, nextStep, lastStepNumber });
        }
      }

      if (newLogs.length > 0) {
        // Batch-insert all touch log entries for this page in one round-trip.
        await prisma.touchLog.createMany({ data: newLogs });

        // Fetch the newly created IDs so we can hand them to the queue workers.
        const created = await prisma.touchLog.findMany({
          where: {
            leadId: { in: newLogs.map((l) => l.leadId) },
            sentAt: null,
            sequenceStepId: { in: newLogs.map((l) => l.sequenceStepId) },
          },
          select: { id: true, leadId: true, sequenceStepId: true },
          orderBy: { createdAt: "desc" },
        });

        const touchLogMap = new Map(
          created.map((tl) => [`${tl.leadId}:${tl.sequenceStepId}`, tl.id])
        );

        // Enqueue outreach jobs in parallel for this page.
        await Promise.all(
          pending.map(({ leadIndex, nextStep, lastStepNumber }) => {
            const lead = leads[leadIndex];
            const touchLogId = touchLogMap.get(`${lead.id}:${nextStep.id}`);
            if (!touchLogId) return Promise.resolve();

            const jobData = { leadId: lead.id, sequenceStepId: nextStep.id, touchLogId };

            if (nextStep.channel === "EMAIL") {
              return queues.emailDispatch.add("send-email", jobData);
            } else if (nextStep.channel === "LINKEDIN") {
              return queues.linkedinOutreach.add("send-linkedin", {
                ...jobData,
                type: lastStepNumber === 0 ? "connection_request" : "dm",
              });
            } else {
              return queues.redditOutreach.add("send-reddit", jobData);
            }
          })
        );

        scheduled += pending.length;
      }
    } while (true);

    console.log(`✅ Follow-up scheduler: ${scheduled} touches queued`);
  },
  { connection }
);

worker.on("failed", (job, err) => {
  console.error(`❌ Follow-up scheduler job failed:`, err.message);
});

export default worker;

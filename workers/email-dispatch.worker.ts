import { Worker, Job } from "bullmq";
import { prisma } from "../lib/prisma";
import { SendGridService } from "../lib/integrations/sendgrid";
import { redisConnection as connection } from "../lib/redis";

interface EmailDispatchJob {
  leadId: string;
  sequenceStepId: string;
  touchLogId: string;
}

const worker = new Worker<EmailDispatchJob>(
  "email-dispatch",
  async (job: Job<EmailDispatchJob>) => {
    const { leadId, sequenceStepId, touchLogId } = job.data;

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { campaign: { include: { org: true } } },
    });
    const step = await prisma.touchSequence.findUnique({ where: { id: sequenceStepId } });

    if (!lead?.email || !step) {
      throw new Error(`Lead has no email or step not found: ${leadId}`);
    }

    // Rate limit: max 200/day per org (basic check)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySent = await prisma.touchLog.count({
      where: {
        lead: { campaign: { orgId: lead.campaign.orgId } },
        sentAt: { gte: today },
        sequenceStep: { channel: "EMAIL" },
      },
    });
    if (todaySent >= 200) {
      throw new Error("Daily email limit reached for org");
    }

    await SendGridService.sendEmail({
      to: lead.email,
      subject: step.subjectLine || "Follow up",
      html: step.bodyTemplate,
      customArgs: { touchLogId },
    });

    await prisma.touchLog.update({
      where: { id: touchLogId },
      data: { sentAt: new Date() },
    });

    console.log(`✅ Email sent to ${lead.email} (step ${step.stepNumber})`);
  },
  {
    connection,
    concurrency: 5,
  }
);

worker.on("failed", async (job, err) => {
  console.error(`❌ Email dispatch job ${job?.id} failed:`, err.message);
  await prisma.webhookEvent.create({
    data: {
      source: "email-dispatch-worker",
      payload: { jobId: job?.id, error: err.message, data: job?.data as any },
    },
  });
});

worker.on("completed", (job) => {
  console.log(`✅ Email dispatch job ${job.id} completed`);
});

export default worker;
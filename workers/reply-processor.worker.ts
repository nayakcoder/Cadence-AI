import { Worker, Job } from "bullmq";
import { prisma } from "../lib/prisma";
import { AIService } from "../lib/services/ai.service";
import { LeadService } from "../lib/services/lead.service";
import { SendGridService } from "../lib/integrations/sendgrid";
import { redisConnection as connection } from "../lib/redis";

interface ReplyProcessorJob {
  leadId: string;
  touchLogId: string;
  replyContent: string;
  channel: string;
}

const worker = new Worker<ReplyProcessorJob>(
  "reply-processor",
  async (job: Job<ReplyProcessorJob>) => {
    const { leadId, touchLogId, replyContent } = job.data;

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { campaign: { include: { org: true } } },
    });
    if (!lead) throw new Error(`Lead not found: ${leadId}`);

    const orgId = lead.campaign.org.id;
    const classification = await AIService.classifyReply(orgId, {
      replyContent,
      leadName: `${lead.firstName} ${lead.lastName}`,
      leadTitle: lead.title || undefined,
      leadCompany: lead.company || undefined,
    });

    // Update touch log and lead status/score concurrently – these two writes are
    // independent so there is no reason to wait for one before starting the other.
    await Promise.all([
      LeadService.updateTouchLog(touchLogId, {
        repliedAt: new Date(),
        replyContent,
        replyClassification: classification.classification as any,
      }),
      // processReply already sets the correct status for UNSUBSCRIBE, so we
      // don't need a separate prisma.lead.update call for that case.
      LeadService.processReply(
        leadId,
        classification.classification as any,
        classification.leadScoreAdjustment
      ),
    ]);

    if (classification.classification === "UNSUBSCRIBE") {
      console.log(`🚫 Lead ${leadId} unsubscribed — all future touches halted`);
    }

    // If POSITIVE: notify all account managers in parallel
    if (classification.classification === "POSITIVE" && classification.suggestedResponse) {
      const managers = await prisma.user.findMany({
        where: { role: "ACCOUNT_MANAGER", orgId },
        select: { email: true },
      });
      await Promise.all(
        managers.map((manager) =>
          SendGridService.sendNotificationEmail(
            manager.email,
            `🎯 Positive reply from ${lead.firstName} ${lead.lastName} at ${lead.company}`,
            `<strong>${lead.firstName} ${lead.lastName}</strong> (${lead.title} at ${lead.company}) replied positively!<br/><br/>
            <strong>Their reply:</strong><br/>${replyContent}<br/><br/>
            <strong>Suggested response:</strong><br/>${classification.suggestedResponse}`
          )
        )
      );
    }

    console.log(`✅ Reply processed for lead ${leadId}: ${classification.classification}`);
  },
  { connection, concurrency: 10 }
);

worker.on("failed", async (job, err) => {
  console.error(`❌ Reply processor job ${job?.id} failed:`, err.message);
});

export default worker;
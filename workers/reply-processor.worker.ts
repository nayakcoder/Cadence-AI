import { Worker, Job } from "bullmq";
import { prisma } from "../lib/prisma";
import { AIService } from "../lib/services/ai.service";
import { LeadService } from "../lib/services/lead.service";
import { SendGridService } from "../lib/integrations/sendgrid";

const redisUrl = new URL(process.env.REDIS_URL || "redis://localhost:6379");
const connection = {
  host: redisUrl.hostname,
  port: parseInt(redisUrl.port) || 6379,
  password: redisUrl.password || undefined,
  maxRetriesPerRequest: null as null,
};

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

    // Update touch log
    await LeadService.updateTouchLog(touchLogId, {
      repliedAt: new Date(),
      replyContent,
      replyClassification: classification.classification as any,
    });

    // Update lead status and score
    await LeadService.processReply(
      leadId,
      classification.classification as any,
      classification.leadScoreAdjustment
    );

    // If UNSUBSCRIBE: halt all future touches
    if (classification.classification === "UNSUBSCRIBE") {
      await prisma.lead.update({
        where: { id: leadId },
        data: { status: "UNSUBSCRIBED" },
      });
      console.log(`🚫 Lead ${leadId} unsubscribed — all future touches halted`);
    }

    // If POSITIVE: notify account managers with suggested response
    if (classification.classification === "POSITIVE" && classification.suggestedResponse) {
      const managers = await prisma.user.findMany({
        where: { role: "ACCOUNT_MANAGER", orgId },
      });
      for (const manager of managers) {
        await SendGridService.sendNotificationEmail(
          manager.email,
          `🎯 Positive reply from ${lead.firstName} ${lead.lastName} at ${lead.company}`,
          `<strong>${lead.firstName} ${lead.lastName}</strong> (${lead.title} at ${lead.company}) replied positively!<br/><br/>
          <strong>Their reply:</strong><br/>${replyContent}<br/><br/>
          <strong>Suggested response:</strong><br/>${classification.suggestedResponse}`
        );
      }
    }

    console.log(`✅ Reply processed for lead ${leadId}: ${classification.classification}`);
  },
  { connection, concurrency: 10 }
);

worker.on("failed", async (job, err) => {
  console.error(`❌ Reply processor job ${job?.id} failed:`, err.message);
});

export default worker;

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AIService } from "@/lib/services/ai.service";
import { LeadService } from "@/lib/services/lead.service";

export async function POST(req: NextRequest) {
  const body = await req.json();
  await prisma.webhookEvent.create({
    data: { source: "linkedin", payload: body },
  });

  if (body.type === "message_reply" && body.leadId && body.message) {
    const lead = await LeadService.findById(body.leadId);
    if (lead) {
      const orgId = lead.campaign.org.id;
      const classification = await AIService.classifyReply(orgId, {
        replyContent: body.message,
        leadName: `${lead.firstName} ${lead.lastName}`,
        leadTitle: lead.title || undefined,
        leadCompany: lead.company || undefined,
      });
      await LeadService.processReply(
        body.leadId,
        classification.classification as any,
        classification.leadScoreAdjustment
      );
    }
  }
  return NextResponse.json({ ok: true });
}
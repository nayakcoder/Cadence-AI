import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AIService } from "@/lib/services/ai.service";
import { LeadService } from "@/lib/services/lead.service";
import { z } from "zod";

const classifyReplySchema = z.object({
  leadId: z.string(),
  replyContent: z.string().min(1),
  lastMessageSent: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const body = await req.json();
  const result = classifyReplySchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: result.error.flatten() }, { status: 400 });

  const lead = await LeadService.findById(result.data.leadId);
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const classification = await AIService.classifyReply(orgId, {
    replyContent: result.data.replyContent,
    leadName: `${lead.firstName} ${lead.lastName}`,
    leadTitle: lead.title || undefined,
    leadCompany: lead.company || undefined,
    lastMessageSent: result.data.lastMessageSent,
  });

  // Update lead status and score
  await LeadService.processReply(
    result.data.leadId,
    classification.classification as any,
    classification.leadScoreAdjustment
  );

  return NextResponse.json(classification);
}

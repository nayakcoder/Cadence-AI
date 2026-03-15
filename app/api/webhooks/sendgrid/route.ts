import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const events = await req.json();
  const eventArray = Array.isArray(events) ? events : [events];

  for (const event of eventArray) {
    const { event: eventType, sg_message_id, timestamp, email } = event;
    const touchLogId = event.touchLogId || event["unique-args"]?.touchLogId;
    if (!touchLogId) continue;

    await prisma.webhookEvent.create({
      data: { source: "sendgrid", payload: event },
    });

    const updateData: Record<string, any> = {};
    if (eventType === "delivered") updateData.deliveredAt = new Date(timestamp * 1000);
    else if (eventType === "open") updateData.openedAt = new Date(timestamp * 1000);
    else if (eventType === "inbound_email" || event.replyContent) {
      updateData.repliedAt = new Date();
      updateData.replyContent = event.text || event.html || "";
    }
    if (Object.keys(updateData).length > 0) {
      await prisma.touchLog.updateMany({ where: { id: touchLogId }, data: updateData });
    }
  }
  return NextResponse.json({ ok: true });
}

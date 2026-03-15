import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const events = await req.json();
  const eventArray: any[] = Array.isArray(events) ? events : [events];

  // Process all events concurrently instead of one-by-one so the response
  // time scales with the slowest single event rather than the sum of all.
  await Promise.all(
    eventArray.map(async (event) => {
      const { event: eventType, timestamp } = event;
      const touchLogId = event.touchLogId || event["unique-args"]?.touchLogId;
      if (!touchLogId) return;

      const updateData: Record<string, unknown> = {};
      if (eventType === "delivered") updateData.deliveredAt = new Date(timestamp * 1000);
      else if (eventType === "open") updateData.openedAt = new Date(timestamp * 1000);
      else if (eventType === "inbound_email" || event.replyContent) {
        updateData.repliedAt = new Date();
        updateData.replyContent = event.text || event.html || "";
      }

      // Persist the raw webhook payload and update the touch log in parallel.
      await Promise.all([
        prisma.webhookEvent.create({ data: { source: "sendgrid", payload: event } }),
        Object.keys(updateData).length > 0
          ? prisma.touchLog.updateMany({ where: { id: touchLogId }, data: updateData })
          : Promise.resolve(),
      ]);
    })
  );

  return NextResponse.json({ ok: true });
}

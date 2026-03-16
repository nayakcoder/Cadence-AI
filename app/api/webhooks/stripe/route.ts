import { NextRequest, NextResponse } from "next/server";
import { BillingService } from "@/lib/services/billing.service";

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature") || "";
  try {
    const event = await BillingService.handleWebhook(payload, signature);
    return NextResponse.json({ received: true, type: event.type });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
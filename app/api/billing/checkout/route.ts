import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BillingService } from "@/lib/services/billing.service";
import { z } from "zod";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const result = z.object({ plan: z.enum(["STARTER", "GROWTH"]) }).safeParse(body);
  if (!result.success) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const orgId = (session.user as any).orgId;
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const checkoutSession = await BillingService.createCheckoutSession(
    orgId,
    result.data.plan,
    session.user.email as string
  );
  return NextResponse.json({ url: checkoutSession.url });
}

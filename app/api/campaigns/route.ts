import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CampaignService } from "@/lib/services/campaign.service";
import { AIService } from "@/lib/services/ai.service";
import { z } from "zod";

const createCampaignSchema = z.object({
  name: z.string().min(1).max(100),
  channels: z.array(z.enum(["LINKEDIN", "EMAIL", "REDDIT"])).min(1),
  totalLeadsTargeted: z.number().min(1).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orgId = (session.user as any).orgId;
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });
  const campaigns = await CampaignService.findByOrg(orgId);
  return NextResponse.json(campaigns);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orgId = (session.user as any).orgId;
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const body = await req.json();
  const result = createCampaignSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  const campaign = await CampaignService.create({
    orgId,
    name: result.data.name,
    channels: result.data.channels as any,
    totalLeadsTargeted: result.data.totalLeadsTargeted,
    startDate: result.data.startDate ? new Date(result.data.startDate) : undefined,
    endDate: result.data.endDate ? new Date(result.data.endDate) : undefined,
  });
  return NextResponse.json(campaign, { status: 201 });
}
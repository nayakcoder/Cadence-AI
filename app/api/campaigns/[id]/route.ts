import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CampaignService } from "@/lib/services/campaign.service";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const campaign = await CampaignService.findById(id);
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const orgId = (session.user as any).orgId;
  if (campaign.orgId !== orgId && (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(campaign);
}

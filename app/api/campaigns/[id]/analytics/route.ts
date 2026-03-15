import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CampaignService } from "@/lib/services/campaign.service";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const analytics = await CampaignService.getAnalytics(params.id);
  if (!analytics) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(analytics);
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CampaignService } from "@/lib/services/campaign.service";
import { notFound } from "next/navigation";
import { CampaignDetailClient } from "@/components/campaigns/campaign-detail-client";

export default async function CampaignDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const campaign = await CampaignService.findById(params.id);
  if (!campaign) notFound();
  const analytics = await CampaignService.getAnalytics(params.id);
  return <CampaignDetailClient campaign={campaign as any} analytics={analytics as any} />;
}

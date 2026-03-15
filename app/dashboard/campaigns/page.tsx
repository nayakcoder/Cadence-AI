import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CampaignService } from "@/lib/services/campaign.service";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function CampaignsPage() {
  const session = await getServerSession(authOptions);
  const orgId = (session?.user as any)?.orgId;
  const campaigns = orgId ? await CampaignService.findByOrg(orgId) : [];

  const statusColors: Record<string, string> = {
    DRAFT: "bg-slate-700 text-slate-300",
    ACTIVE: "bg-green-900 text-green-300",
    PAUSED: "bg-yellow-900 text-yellow-300",
    COMPLETED: "bg-blue-900 text-blue-300",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Campaigns</h1>
          <p className="text-slate-400 mt-1">Manage your outreach campaigns</p>
        </div>
        <Link href="/dashboard/onboarding"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + New Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800 text-center py-16">
          <CardContent>
            <div className="text-5xl mb-4">🚀</div>
            <p className="text-slate-400 mb-6">No campaigns yet. Create your first campaign.</p>
            <Link href="/dashboard/onboarding"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors">
              Create Campaign
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <Link key={campaign.id} href={`/dashboard/campaigns/${campaign.id}`}>
              <Card className="bg-slate-900 border-slate-800 hover:border-slate-600 transition-colors cursor-pointer">
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="font-semibold text-white">{campaign.name}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[campaign.status]}`}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="text-slate-400 text-sm mt-1">
                      {campaign.channels.join(" · ")} ·{" "}
                      {campaign.startDate ? `Started ${formatDate(campaign.startDate)}` : "Draft"}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-6 text-right">
                    <div>
                      <div className="text-white font-semibold">{campaign.totalLeadsTargeted}</div>
                      <div className="text-slate-500 text-xs">Targeted</div>
                    </div>
                    <div>
                      <div className="text-white font-semibold">{campaign.totalContacted}</div>
                      <div className="text-slate-500 text-xs">Contacted</div>
                    </div>
                    <div>
                      <div className="text-white font-semibold">{campaign.totalReplied}</div>
                      <div className="text-slate-500 text-xs">Replied</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

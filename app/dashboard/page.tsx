import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CampaignService } from "@/lib/services/campaign.service";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const orgId = (session?.user as any)?.orgId;

  const campaigns = orgId ? await CampaignService.findByOrg(orgId) : [];
  const totalLeads = campaigns.reduce((sum, c) => sum + (c._count?.leads || 0), 0);
  const totalContacted = campaigns.reduce((sum, c) => sum + c.totalContacted, 0);
  const totalReplied = campaigns.reduce((sum, c) => sum + c.totalReplied, 0);
  const totalBooked = campaigns.reduce((sum, c) => sum + c.totalBooked, 0);
  const replyRate = totalContacted > 0 ? Math.round((totalReplied / totalContacted) * 100) : 0;

  const statusColors: Record<string, string> = {
    DRAFT: "bg-slate-700 text-slate-300",
    ACTIVE: "bg-green-900 text-green-300",
    PAUSED: "bg-yellow-900 text-yellow-300",
    COMPLETED: "bg-blue-900 text-blue-300",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Welcome back, {session?.user?.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: totalLeads, icon: "👥" },
          { label: "Contacted", value: totalContacted, icon: "📤" },
          { label: "Replied", value: totalReplied, icon: "💬" },
          { label: "Booked", value: totalBooked, icon: "📅" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reply Rate Banner */}
      <Card className="bg-indigo-600/20 border-indigo-500/30">
        <CardContent className="pt-6 flex items-center justify-between">
          <div>
            <div className="text-slate-300 text-sm">Overall Reply Rate</div>
            <div className="text-4xl font-bold text-indigo-400">{replyRate}%</div>
          </div>
          <div className="text-5xl">📈</div>
        </CardContent>
      </Card>

      {/* Campaigns */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Campaigns</h2>
          <Link href="/dashboard/campaigns/new" className="text-indigo-400 hover:underline text-sm">+ New Campaign</Link>
        </div>
        {campaigns.length === 0 ? (
          <Card className="bg-slate-900 border-slate-800 text-center py-12">
            <CardContent>
              <div className="text-4xl mb-4">🚀</div>
              <p className="text-slate-400 mb-4">No campaigns yet. Start by completing your onboarding.</p>
              <Link href="/dashboard/onboarding" className="text-indigo-400 hover:underline">Complete Onboarding →</Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <Link key={campaign.id} href={`/dashboard/campaigns/${campaign.id}`}>
                <Card className="bg-slate-900 border-slate-800 hover:border-slate-600 transition-colors cursor-pointer">
                  <CardContent className="pt-4 pb-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{campaign.name}</div>
                      <div className="text-slate-400 text-sm mt-1">
                        {campaign.channels.join(" · ")} · Started {campaign.startDate ? formatDate(campaign.startDate) : "Not started"}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-white font-semibold">{campaign.totalReplied}/{campaign.totalContacted}</div>
                        <div className="text-slate-500 text-xs">replied/contacted</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[campaign.status] || "bg-slate-700 text-slate-300"}`}>
                        {campaign.status}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
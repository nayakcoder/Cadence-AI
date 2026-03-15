import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";

export default async function ManagerPage() {
  const orgs = await prisma.organization.findMany({
    include: {
      users: { where: { role: "CLIENT" } },
      campaigns: {
        include: { _count: { select: { leads: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Client Overview</h1>
        <p className="text-slate-400 mt-1">{orgs.length} organizations managed</p>
      </div>

      <div className="space-y-3">
        {orgs.map((org) => {
          const activeCampaigns = org.campaigns.filter((c) => c.status === "ACTIVE").length;
          const totalLeads = org.campaigns.reduce((sum, c) => sum + (c._count?.leads || 0), 0);
          const totalReplied = org.campaigns.reduce((sum, c) => sum + c.totalReplied, 0);
          const totalContacted = org.campaigns.reduce((sum, c) => sum + c.totalContacted, 0);
          const replyRate = totalContacted > 0 ? Math.round((totalReplied / totalContacted) * 100) : 0;

          return (
            <Card key={org.id} className="bg-slate-900 border-slate-800 hover:border-slate-600 transition-colors">
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">{org.name}</div>
                  <div className="text-slate-400 text-sm mt-1">
                    {org.plan} · {activeCampaigns} active campaigns · {org.users.length} users
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-8 text-right">
                  <div>
                    <div className="text-white font-semibold">{totalLeads}</div>
                    <div className="text-slate-500 text-xs">Total Leads</div>
                  </div>
                  <div>
                    <div className="text-white font-semibold">{replyRate}%</div>
                    <div className="text-slate-500 text-xs">Reply Rate</div>
                  </div>
                  <div>
                    <span className={`text-xs px-2 py-1 rounded-full ${org.status === "ACTIVE" ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>
                      {org.status}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

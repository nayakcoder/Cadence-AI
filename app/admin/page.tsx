import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminMRR } from "@/components/admin/admin-mrr";

export default async function AdminPage() {
  const [orgCount, userCount, campaignCount, apiUsage] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count(),
    prisma.campaign.count(),
    prisma.apiUsageLog.aggregate({
      _sum: { estimatedCost: true, inputTokens: true, outputTokens: true },
    }),
  ]);

  const totalCost = apiUsage._sum.estimatedCost ? Number(apiUsage._sum.estimatedCost) : 0;

  const recentOrgs = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      _count: { select: { campaigns: true, users: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Overview</h1>
        <p className="text-slate-400 mt-1">Platform-wide metrics and management</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Organizations", value: orgCount, icon: "🏢" },
          { label: "Users", value: userCount, icon: "👤" },
          { label: "Campaigns", value: campaignCount, icon: "🚀" },
          { label: "AI API Cost", value: `$${totalCost.toFixed(2)}`, icon: "🤖" },
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

      <AdminMRR />

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-slate-400 text-sm pb-3">Organization</th>
                <th className="text-left text-slate-400 text-sm pb-3">Plan</th>
                <th className="text-left text-slate-400 text-sm pb-3">Status</th>
                <th className="text-left text-slate-400 text-sm pb-3">Campaigns</th>
                <th className="text-left text-slate-400 text-sm pb-3">Users</th>
              </tr>
            </thead>
            <tbody>
              {recentOrgs.map((org) => (
                <tr key={org.id} className="border-b border-slate-800/50">
                  <td className="py-3 text-white font-medium">{org.name}</td>
                  <td className="py-3 text-slate-300">{org.plan}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${org.status === "ACTIVE" ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>
                      {org.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-300">{org._count.campaigns}</td>
                  <td className="py-3 text-slate-300">{org._count.users}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";

export default async function LeadsPage() {
  const session = await getServerSession(authOptions);
  const orgId = (session?.user as any)?.orgId;

  const leads = orgId
    ? await prisma.lead.findMany({
        where: { campaign: { orgId } },
        include: { campaign: true },
        orderBy: { createdAt: "desc" },
        take: 100,
      })
    : [];

  const statusColors: Record<string, string> = {
    NEW: "bg-slate-700 text-slate-300",
    CONTACTED: "bg-blue-900 text-blue-300",
    REPLIED: "bg-yellow-900 text-yellow-300",
    INTERESTED: "bg-green-900 text-green-300",
    BOOKED: "bg-indigo-900 text-indigo-300",
    UNSUBSCRIBED: "bg-red-900 text-red-300",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Leads</h1>
        <p className="text-slate-400 mt-1">{leads.length} leads across all campaigns</p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-slate-400 text-sm p-4">Name</th>
                <th className="text-left text-slate-400 text-sm p-4">Title</th>
                <th className="text-left text-slate-400 text-sm p-4">Company</th>
                <th className="text-left text-slate-400 text-sm p-4">Campaign</th>
                <th className="text-left text-slate-400 text-sm p-4">Status</th>
                <th className="text-left text-slate-400 text-sm p-4">Score</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-slate-400 py-12">
                    No leads yet. Import leads via a campaign.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 text-white font-medium">{lead.firstName} {lead.lastName}</td>
                    <td className="p-4 text-slate-300">{lead.title || "—"}</td>
                    <td className="p-4 text-slate-300">{lead.company || "—"}</td>
                    <td className="p-4 text-slate-400 text-sm">{lead.campaign.name}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[lead.status]}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-700 rounded-full h-1.5">
                          <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${lead.leadScore}%` }} />
                        </div>
                        <span className="text-slate-400 text-xs">{lead.leadScore}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface CampaignDetailClientProps {
  campaign: any;
  analytics: any;
}

export function CampaignDetailClient({ campaign, analytics }: CampaignDetailClientProps) {
  const [status, setStatus] = useState(campaign.status);
  const [loading, setLoading] = useState(false);

  async function handlePauseResume() {
    setLoading(true);
    const action = status === "ACTIVE" ? "pause" : "resume";
    const res = await fetch(`/api/campaigns/${campaign.id}/${action}`, { method: "POST" });
    if (res.ok) setStatus(status === "ACTIVE" ? "PAUSED" : "ACTIVE");
    setLoading(false);
  }

  const statusColors: Record<string, string> = {
    DRAFT: "bg-slate-700 text-slate-300",
    ACTIVE: "bg-green-900 text-green-300",
    PAUSED: "bg-yellow-900 text-yellow-300",
    COMPLETED: "bg-blue-900 text-blue-300",
  };

  const funnelData = [
    { name: "Targeted", value: analytics?.totalLeadsTargeted || 0 },
    { name: "Contacted", value: analytics?.totalContacted || 0 },
    { name: "Replied", value: analytics?.totalReplied || 0 },
    { name: "Booked", value: analytics?.totalBooked || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">{campaign.name}</h1>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[status]}`}>{status}</span>
          </div>
          <div className="text-slate-400 mt-1">{campaign.channels?.join(" · ")}</div>
        </div>
        <div className="flex gap-2">
          {(status === "ACTIVE" || status === "PAUSED") && (
            <Button
              onClick={handlePauseResume}
              disabled={loading}
              variant={status === "ACTIVE" ? "outline" : "default"}
              className={status === "ACTIVE" ? "border-yellow-600 text-yellow-400" : "bg-green-600 hover:bg-green-700"}
            >
              {status === "ACTIVE" ? "⏸ Pause" : "▶ Resume"}
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Targeted", value: analytics?.totalLeadsTargeted || 0 },
          { label: "Contacted", value: analytics?.totalContacted || 0 },
          { label: "Reply Rate", value: `${analytics?.replyRate || 0}%` },
          { label: "Booked", value: analytics?.totalBooked || 0 },
        ].map((s) => (
          <Card key={s.label} className="bg-slate-900 border-slate-800">
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-slate-400 text-sm">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="funnel" className="w-full">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="funnel" className="data-[state=active]:bg-indigo-600">Funnel</TabsTrigger>
          <TabsTrigger value="sequence" className="data-[state=active]:bg-indigo-600">Sequence</TabsTrigger>
          <TabsTrigger value="pipeline" className="data-[state=active]:bg-indigo-600">Pipeline</TabsTrigger>
        </TabsList>

        <TabsContent value="funnel">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader><CardTitle className="text-white">Campaign Funnel</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", color: "#f1f5f9" }} />
                  <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sequence">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader><CardTitle className="text-white">Sequence Performance</CardTitle></CardHeader>
            <CardContent>
              {analytics?.sequencePerformance?.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.sequencePerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="stepNumber" stroke="#94a3b8" tickFormatter={(v) => `Step ${v}`} />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", color: "#f1f5f9" }} />
                    <Bar dataKey="sent" fill="#6366f1" name="Sent" />
                    <Bar dataKey="replied" fill="#a78bfa" name="Replied" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-400 text-center py-12">No sequence data yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader><CardTitle className="text-white">Lead Pipeline</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {analytics?.leadsByStatus && Object.entries(analytics.leadsByStatus).map(([leadStatus, count]) => (
                  <div key={leadStatus} className="bg-slate-800 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-white">{count as number}</div>
                    <div className="text-slate-400 text-xs mt-1">{leadStatus}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

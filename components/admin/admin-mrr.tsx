"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function AdminMRR() {
  const [mrr, setMrr] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/mrr")
      .then((r) => r.json())
      .then((d) => { setMrr(d.mrr); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Card className="bg-indigo-600/20 border-indigo-500/30">
      <CardHeader>
        <CardTitle className="text-white">Monthly Recurring Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-slate-400">Loading MRR from Stripe...</div>
        ) : (
          <div className="text-4xl font-bold text-indigo-400">
            {mrr !== null ? formatCurrency(mrr) : "—"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
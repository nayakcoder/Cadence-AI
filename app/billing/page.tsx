"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUpgrade(plan: string) {
    setLoading(plan);
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setLoading(null);
  }

  async function handleManage() {
    setLoading("manage");
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setLoading(null);
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Billing</h1>
          <p className="text-slate-400 mt-1">Manage your subscription plan</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: "Starter",
              price: "$1,497/mo",
              plan: "STARTER",
              features: ["1 Channel", "500 leads/mo", "AI Copy Generation", "Account Manager"],
              highlighted: false,
            },
            {
              name: "Growth",
              price: "$2,997/mo",
              plan: "GROWTH",
              features: ["All 3 Channels", "2,000 leads/mo", "Advanced Analytics", "Priority Support"],
              highlighted: true,
            },
            {
              name: "Enterprise",
              price: "Custom",
              plan: "ENTERPRISE",
              features: ["Unlimited leads", "Custom channels", "Dedicated team", "White-label"],
              highlighted: false,
            },
          ].map((tier) => (
            <Card key={tier.name} className={`${tier.highlighted ? "border-indigo-500 bg-indigo-600/10" : "bg-slate-900 border-slate-800"}`}>
              <CardHeader>
                <CardTitle className="text-white">{tier.name}</CardTitle>
                <div className="text-2xl font-bold text-indigo-400">{tier.price}</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="text-slate-300 text-sm flex items-center gap-2">
                      <span className="text-indigo-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
                {tier.plan !== "ENTERPRISE" ? (
                  <Button
                    onClick={() => handleUpgrade(tier.plan)}
                    disabled={!!loading}
                    className={`w-full ${tier.highlighted ? "bg-indigo-600 hover:bg-indigo-700" : "bg-slate-700 hover:bg-slate-600"}`}
                  >
                    {loading === tier.plan ? "Loading..." : "Select Plan"}
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300">
                    Contact Sales
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <div className="text-white font-semibold">Manage Subscription</div>
              <div className="text-slate-400 text-sm">Update payment method, download invoices</div>
            </div>
            <Button onClick={handleManage} disabled={!!loading} variant="outline" className="border-slate-600 text-slate-300">
              {loading === "manage" ? "Loading..." : "Customer Portal →"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
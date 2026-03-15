"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const steps = ["Company & ICP", "Value Props", "Channels & Goals", "Review"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    companyDescription: "",
    targetTitles: "",
    targetIndustries: "",
    companySizeMin: 10,
    companySizeMax: 1000,
    painPoints: "",
    valueProps: "",
    tonePreference: "PROFESSIONAL" as "PROFESSIONAL" | "CASUAL" | "AGGRESSIVE",
    channels: [] as string[],
    monthlyLeadGoal: 100,
    calendlyLink: "",
  });

  function update(key: string, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleChannel(channel: string) {
    setForm((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        targetTitles: form.targetTitles.split(",").map((t) => t.trim()).filter(Boolean),
        targetIndustries: form.targetIndustries.split(",").map((t) => t.trim()).filter(Boolean),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Setup failed. Please try again.");
      setLoading(false);
    } else {
      router.push(`/dashboard/campaigns/${data.campaign.id}`);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Campaign Setup Wizard</h1>
        <p className="text-slate-400 mt-1">Tell us about your business and ideal customer profile.</p>
      </div>

      {/* Step Indicator */}
      <div className="flex gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex-1">
            <div className={`h-1.5 rounded-full transition-colors ${i <= step ? "bg-indigo-600" : "bg-slate-700"}`} />
            <div className={`text-xs mt-1.5 ${i === step ? "text-indigo-400" : "text-slate-500"}`}>{s}</div>
          </div>
        ))}
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="pt-6 space-y-6">
          {step === 0 && (
            <>
              <div>
                <Label className="text-slate-300">Company Description</Label>
                <Textarea value={form.companyDescription} onChange={(e) => update("companyDescription", e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white mt-1" rows={3}
                  placeholder="We help SaaS companies automate their sales workflows..." />
              </div>
              <div>
                <Label className="text-slate-300">Target Job Titles (comma-separated)</Label>
                <Input value={form.targetTitles} onChange={(e) => update("targetTitles", e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                  placeholder="VP of Sales, Head of Growth, Sales Director" />
              </div>
              <div>
                <Label className="text-slate-300">Target Industries (comma-separated)</Label>
                <Input value={form.targetIndustries} onChange={(e) => update("targetIndustries", e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                  placeholder="SaaS, FinTech, Healthcare Tech" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Min Company Size</Label>
                  <Input type="number" value={form.companySizeMin} onChange={(e) => update("companySizeMin", parseInt(e.target.value))}
                    className="bg-slate-800 border-slate-700 text-white mt-1" />
                </div>
                <div>
                  <Label className="text-slate-300">Max Company Size</Label>
                  <Input type="number" value={form.companySizeMax} onChange={(e) => update("companySizeMax", parseInt(e.target.value))}
                    className="bg-slate-800 border-slate-700 text-white mt-1" />
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <Label className="text-slate-300">Pain Points (what problems do you solve?)</Label>
                <Textarea value={form.painPoints} onChange={(e) => update("painPoints", e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white mt-1" rows={4}
                  placeholder="Sales teams waste 60% of their time on manual follow-ups..." />
              </div>
              <div>
                <Label className="text-slate-300">Value Propositions (why choose you?)</Label>
                <Textarea value={form.valueProps} onChange={(e) => update("valueProps", e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white mt-1" rows={4}
                  placeholder="We automate the entire outreach process, saving 10+ hours per week..." />
              </div>
              <div>
                <Label className="text-slate-300">Tone Preference</Label>
                <div className="flex gap-3 mt-2">
                  {(["PROFESSIONAL", "CASUAL", "AGGRESSIVE"] as const).map((tone) => (
                    <button key={tone} onClick={() => update("tonePreference", tone)}
                      className={`px-4 py-2 rounded-lg text-sm border transition-colors ${form.tonePreference === tone ? "border-indigo-500 bg-indigo-600/20 text-indigo-300" : "border-slate-700 text-slate-400 hover:border-slate-500"}`}>
                      {tone.charAt(0) + tone.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <Label className="text-slate-300">Outreach Channels</Label>
                <div className="flex gap-3 mt-2">
                  {["LINKEDIN", "EMAIL", "REDDIT"].map((channel) => (
                    <button key={channel} onClick={() => toggleChannel(channel)}
                      className={`px-4 py-2 rounded-lg text-sm border transition-colors ${form.channels.includes(channel) ? "border-indigo-500 bg-indigo-600/20 text-indigo-300" : "border-slate-700 text-slate-400 hover:border-slate-500"}`}>
                      {channel}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-slate-300">Monthly Lead Goal</Label>
                <Input type="number" value={form.monthlyLeadGoal} onChange={(e) => update("monthlyLeadGoal", parseInt(e.target.value))}
                  className="bg-slate-800 border-slate-700 text-white mt-1" min={1} />
              </div>
              <div>
                <Label className="text-slate-300">Calendly / Booking Link (optional)</Label>
                <Input value={form.calendlyLink} onChange={(e) => update("calendlyLink", e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white mt-1" placeholder="https://calendly.com/your-link" />
              </div>
            </>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Review Your Setup</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Targets</span>
                  <span className="text-white">{form.targetTitles}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Industries</span>
                  <span className="text-white">{form.targetIndustries}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Channels</span>
                  <span className="text-white">{form.channels.join(", ") || "None selected"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Tone</span>
                  <span className="text-white">{form.tonePreference}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Monthly Lead Goal</span>
                  <span className="text-white">{form.monthlyLeadGoal}</span>
                </div>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" className="border-slate-700 text-slate-300" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
          Back
        </Button>
        {step < steps.length - 1 ? (
          <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setStep((s) => s + 1)}>
            Next →
          </Button>
        ) : (
          <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSubmit} disabled={loading}>
            {loading ? "Launching Campaign..." : "Launch Campaign 🚀"}
          </Button>
        )}
      </div>
    </div>
  );
}

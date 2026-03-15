import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-sm">C</div>
          <span className="font-bold text-xl">Cadence AI</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-indigo-600 hover:bg-indigo-700">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-4 pt-24 pb-16 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full px-4 py-1.5 text-sm text-indigo-300 mb-8">
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
          AI-Powered SDR Platform
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Turn Cold Outreach Into
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400"> Booked Calls</span>
        </h1>
        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
          Cadence AI orchestrates personalized, multi-touch outreach across LinkedIn, Email, and Reddit — fully managed with an AI + human account manager layer.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-6">
              Start Free Trial
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8 py-6">
              View Demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-white/10">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "3.2x", label: "Average Reply Rate Lift" },
            { value: "500+", label: "Leads Per Month" },
            { value: "3", label: "Channels Orchestrated" },
            { value: "< 48h", label: "Campaign Launch Time" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-indigo-400">{stat.value}</div>
              <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Starter",
              price: "$1,497",
              period: "/mo",
              features: ["1 Channel", "500 leads/mo", "LinkedIn OR Email", "AI Copy Generation", "Account Manager"],
              cta: "Get Started",
              highlighted: false,
            },
            {
              name: "Growth",
              price: "$2,997",
              period: "/mo",
              features: ["All 3 Channels", "2,000 leads/mo", "LinkedIn + Email + Reddit", "Advanced Analytics", "Priority Account Manager"],
              cta: "Most Popular",
              highlighted: true,
            },
            {
              name: "Enterprise",
              price: "Custom",
              period: "",
              features: ["Unlimited leads", "Custom channels", "Dedicated team", "White-label option", "Custom integrations"],
              cta: "Contact Sales",
              highlighted: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 border ${
                plan.highlighted
                  ? "border-indigo-500 bg-indigo-600/20"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="text-4xl font-bold mb-1">
                {plan.price}<span className="text-lg text-slate-400">{plan.period}</span>
              </div>
              <ul className="my-6 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-slate-300">
                    <span className="text-indigo-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register">
                <Button
                  className={`w-full ${plan.highlighted ? "bg-indigo-600 hover:bg-indigo-700" : "bg-white/10 hover:bg-white/20"}`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

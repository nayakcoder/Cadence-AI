"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Mail,
  Linkedin,
  MessageSquare,
  BarChart2,
  Users,
  Shield,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
  Star,
  Bot,
  CalendarCheck,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─────────────── animation helpers ─────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" as const },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ─────────────── sub-components ─────────────── */

function Navbar() {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "How it works", href: "#how-it-works" },
    { label: "Channels", href: "#channels" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/8 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm text-white">C</div>
          <span className="font-bold text-lg text-white tracking-tight">Cadence AI</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-slate-400 hover:text-white transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/10">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-slate-300 hover:text-white p-1"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden bg-slate-950 border-b border-white/10 px-6 pb-6 pt-2 space-y-4"
          >
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="block text-slate-300 hover:text-white py-1.5 text-sm"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setOpen(false)}>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-500">Get Started</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-40 pb-24 px-4 text-center">
      {/* Background glow blobs */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-purple-700/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        className="relative max-w-4xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Badge */}
        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-indigo-500/15 border border-indigo-500/30 rounded-full px-4 py-1.5 text-sm text-indigo-300 mb-8">
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
          AI-Powered SDR Platform
        </motion.div>

        {/* Headline */}
        <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
          Turn Cold Outreach Into
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            {" "}Booked Calls
          </span>
        </motion.h1>

        {/* Sub-copy */}
        <motion.p variants={fadeUp} className="text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto mb-10">
          Cadence AI orchestrates personalized, multi-touch outreach across LinkedIn, Email, and Reddit — fully managed with an AI&nbsp;+&nbsp;human account manager layer so you never lift a finger.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white text-base font-semibold px-8 h-12 gap-2">
              Start Free Trial <ArrowRight size={16} />
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 text-base h-12">
              See How It Works
            </Button>
          </a>
        </motion.div>

        {/* Trust footnote */}
        <motion.p variants={fadeUp} className="text-slate-500 text-sm mt-6">
          No credit card required · Cancel anytime · 48-hour campaign launch
        </motion.p>
      </motion.div>
    </section>
  );
}

function LogoBar() {
  const logos = ["Acme Corp", "Nexus AI", "Bluewave", "Stratify", "Optix Labs", "Growthly"];
  return (
    <section className="py-10 border-y border-white/8">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-center text-slate-500 text-sm uppercase tracking-widest mb-6">
          Trusted by fast-growing B2B teams
        </p>
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
          {logos.map((name) => (
            <span key={name} className="text-slate-600 font-semibold text-lg tracking-tight select-none">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const items = [
    { value: "3.2×", label: "Average reply-rate lift" },
    { value: "48 h", label: "Campaign launch time" },
    { value: "2,000+", label: "Leads reached per month" },
    { value: "95%", label: "Client retention rate" },
  ];
  return (
    <section className="py-16 max-w-5xl mx-auto px-6">
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={stagger}
      >
        {items.map((s) => (
          <motion.div key={s.label} variants={fadeUp}>
            <div className="text-4xl font-extrabold text-indigo-400 mb-1">{s.value}</div>
            <div className="text-slate-400 text-sm">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: <Users size={28} className="text-indigo-400" />,
      title: "1. Define Your ICP",
      desc: "Tell us your target titles, industries, pain points, and value props. Our onboarding takes under 10 minutes.",
    },
    {
      icon: <Bot size={28} className="text-indigo-400" />,
      title: "2. AI Writes & Schedules",
      desc: "Claude generates hyper-personalized copy for every lead. Multi-touch sequences go live across your chosen channels automatically.",
    },
    {
      icon: <CalendarCheck size={28} className="text-indigo-400" />,
      title: "3. Calls Land in Your Calendar",
      desc: "Positive replies are classified by AI, escalated to your account manager, and converted into booked meetings.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.p variants={fadeUp} className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-3">
            How It Works
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold">
            From ICP to booked call in 3 steps
          </motion.h2>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          {steps.map((step) => (
            <motion.div
              key={step.title}
              variants={fadeUp}
              className="bg-slate-900/60 border border-white/8 rounded-2xl p-8 hover:border-indigo-500/40 transition-colors"
            >
              <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center mb-5">
                {step.icon}
              </div>
              <h3 className="font-bold text-lg text-white mb-2">{step.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Channels() {
  const channels = [
    {
      icon: <Linkedin size={24} />,
      color: "from-blue-600/20 to-blue-800/10",
      border: "border-blue-500/30",
      iconBg: "bg-blue-600/20 text-blue-400",
      name: "LinkedIn",
      headline: "Connection requests that get accepted",
      features: [
        "AI-written connection notes (≤ 300 chars)",
        "Follow-up DM sequences after acceptance",
        "Daily limit governor (20 connections / 30 DMs)",
        "Reply classification & escalation",
      ],
    },
    {
      icon: <Mail size={24} />,
      color: "from-indigo-600/20 to-indigo-800/10",
      border: "border-indigo-500/30",
      iconBg: "bg-indigo-600/20 text-indigo-400",
      name: "Email",
      headline: "Deliverable emails that get read",
      features: [
        "Personalized subject lines & bodies",
        "Multi-step drip sequences",
        "SendGrid open / click / reply tracking",
        "200 sends/day rate-limiting per org",
      ],
    },
    {
      icon: <MessageSquare size={24} />,
      color: "from-orange-600/20 to-orange-800/10",
      border: "border-orange-500/30",
      iconBg: "bg-orange-600/20 text-orange-400",
      name: "Reddit",
      headline: "Community DMs with human oversight",
      features: [
        "Account manager approval before every send",
        "Context-aware community messaging",
        "Username-based lead targeting",
        "Pending-approval workflow built-in",
      ],
    },
  ];

  return (
    <section id="channels" className="py-24 px-4 bg-slate-950/60">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.p variants={fadeUp} className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-3">
            Multi-Channel Outreach
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold">
            Meet prospects where they live
          </motion.h2>
          <motion.p variants={fadeUp} className="text-slate-400 mt-4 max-w-xl mx-auto">
            One platform, three channels, zero manual effort. Each channel is tuned with built-in safety governors and rate limits.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
        >
          {channels.map((ch) => (
            <motion.div
              key={ch.name}
              variants={fadeUp}
              className={`rounded-2xl border ${ch.border} bg-gradient-to-b ${ch.color} p-8`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${ch.iconBg}`}>
                {ch.icon}
              </div>
              <h3 className="font-bold text-xl text-white mb-1">{ch.name}</h3>
              <p className="text-slate-400 text-sm mb-5">{ch.headline}</p>
              <ul className="space-y-2.5">
                {ch.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-green-400" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: <Bot size={22} className="text-indigo-400" />,
      title: "Claude-Powered Copy",
      desc: "Every message is generated by Claude 3.5 Sonnet and personalized using ICP data, enrichment info, and conversation history.",
    },
    {
      icon: <TrendingUp size={22} className="text-indigo-400" />,
      title: "Lead Scoring",
      desc: "Replies are automatically classified (Positive, Neutral, Negative, OOO, Unsubscribe) and each lead's score is updated in real time.",
    },
    {
      icon: <BarChart2 size={22} className="text-indigo-400" />,
      title: "Full Analytics",
      desc: "Track send, open, reply, and booking rates per sequence step. Spot bottlenecks and optimise copy instantly.",
    },
    {
      icon: <Users size={22} className="text-indigo-400" />,
      title: "Account Manager Layer",
      desc: "A dedicated human reviews flagged replies, sends custom responses, and ensures quality at every touchpoint.",
    },
    {
      icon: <Shield size={22} className="text-indigo-400" />,
      title: "Compliance Built-In",
      desc: "Automatic unsubscribe handling, domain blacklists, and per-org daily send limits keep you out of spam folders.",
    },
    {
      icon: <Zap size={22} className="text-indigo-400" />,
      title: "Instant Onboarding",
      desc: "AI generates your first campaign draft the moment you finish onboarding. You're live in under 48 hours.",
    },
  ];

  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.p variants={fadeUp} className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-3">
            Platform Features
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold">
            Everything you need to scale outreach
          </motion.h2>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
        >
          {items.map((item) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              className="bg-slate-900/60 border border-white/8 rounded-2xl p-6 hover:border-indigo-500/30 transition-colors group"
            >
              <div className="w-10 h-10 bg-indigo-600/15 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-600/25 transition-colors">
                {item.icon}
              </div>
              <h3 className="font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    {
      body: "We went from 2% cold email reply rates to 7.4% in the first month. Cadence AI's personalization is unlike anything we've seen.",
      author: "Sarah K.",
      role: "Head of Sales, Nexus AI",
      stars: 5,
    },
    {
      body: "The LinkedIn sequencing alone paid for itself in week 2. Having an account manager in the loop gives us confidence we're not spamming anyone.",
      author: "Marcus T.",
      role: "Founder, Growthly",
      stars: 5,
    },
    {
      body: "We handed over ICP details on a Monday. Our first campaign was live Wednesday. That speed is unreal.",
      author: "Priya M.",
      role: "VP Sales, Stratify",
      stars: 5,
    },
  ];

  return (
    <section className="py-24 px-4 bg-slate-950/60">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.p variants={fadeUp} className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-3">
            Customer Stories
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold">
            Loved by sales teams
          </motion.h2>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
        >
          {quotes.map((q) => (
            <motion.div
              key={q.author}
              variants={fadeUp}
              className="bg-slate-900/70 border border-white/8 rounded-2xl p-7 flex flex-col gap-4"
            >
              <div className="flex gap-1">
                {Array.from({ length: q.stars }).map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 leading-relaxed text-sm flex-1">&ldquo;{q.body}&rdquo;</p>
              <div>
                <div className="font-semibold text-white text-sm">{q.author}</div>
                <div className="text-slate-500 text-xs">{q.role}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "$1,497",
      period: "/mo",
      desc: "Perfect for a single channel and growing teams.",
      features: [
        "1 outreach channel",
        "500 leads / month",
        "LinkedIn OR Email",
        "AI copy generation",
        "Dedicated account manager",
        "Reply classification",
      ],
      cta: "Get Started",
      href: "/register",
      highlighted: false,
    },
    {
      name: "Growth",
      price: "$2,997",
      period: "/mo",
      desc: "Full multi-channel power for scaling revenue teams.",
      features: [
        "All 3 channels",
        "2,000 leads / month",
        "LinkedIn + Email + Reddit",
        "Advanced analytics",
        "Priority account manager",
        "Lead scoring & segmentation",
      ],
      cta: "Get Started",
      href: "/register",
      highlighted: true,
      badge: "Most Popular",
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      desc: "Unlimited scale with a dedicated team and custom integrations.",
      features: [
        "Unlimited leads",
        "Custom channel mix",
        "Dedicated full-stack team",
        "White-label option",
        "Custom CRM integrations",
        "SLA-backed uptime",
      ],
      cta: "Contact Sales",
      href: "/register",
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.p variants={fadeUp} className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-3">
            Pricing
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold">
            Simple, transparent pricing
          </motion.h2>
          <motion.p variants={fadeUp} className="text-slate-400 mt-4">
            All plans include a human account manager. No hidden fees.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              className={`relative rounded-2xl p-8 border flex flex-col ${
                plan.highlighted
                  ? "border-indigo-500 bg-indigo-600/15 shadow-lg shadow-indigo-500/10"
                  : "border-white/10 bg-white/4"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}
              <div className="mb-5">
                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-slate-400 text-sm">{plan.desc}</p>
              </div>
              <div className="text-4xl font-extrabold text-white mb-6">
                {plan.price}
                <span className="text-lg font-normal text-slate-400">{plan.period}</span>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 size={15} className="shrink-0 text-indigo-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={plan.href}>
                <Button
                  className={`w-full font-semibold ${
                    plan.highlighted
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    {
      q: "How quickly can I get a campaign live?",
      a: "Most clients are live within 48 hours. After you complete onboarding (< 10 min), our AI generates your first campaign draft and your account manager finalises sequences before launch.",
    },
    {
      q: "Will outreach come from my own accounts?",
      a: "Yes. You connect your own LinkedIn and email accounts. Cadence AI orchestrates sends on your behalf — your prospects see messages from you, not from us.",
    },
    {
      q: "How does AI personalisation work?",
      a: "We use Claude 3.5 Sonnet to generate copy based on your ICP, the lead's title, company, enrichment data, and prior conversation history. Every message is unique.",
    },
    {
      q: "What happens when a lead replies?",
      a: "Replies are automatically classified (Positive, Neutral, Negative, OOO, Unsubscribe). Positive replies trigger an immediate notification to your account manager with a suggested response.",
    },
    {
      q: "Is there a free trial?",
      a: "Yes. You can sign up, complete onboarding, and have your first campaign drafted at no charge. A card is only required when you activate sends.",
    },
    {
      q: "Can I cancel at any time?",
      a: "Absolutely. All plans are month-to-month. Cancel from your billing portal and you won't be charged again.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 px-4 bg-slate-950/60">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.p variants={fadeUp} className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-3">
            FAQ
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold">
            Common questions
          </motion.h2>
        </motion.div>

        <motion.div
          className="space-y-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
        >
          {items.map((item, i) => (
            <motion.div key={i} variants={fadeUp}>
              <button
                className="w-full text-left bg-slate-900/70 border border-white/8 rounded-xl px-6 py-4 flex items-center justify-between gap-4 hover:border-indigo-500/30 transition-colors"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="font-medium text-white text-sm">{item.q}</span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-slate-400 transition-transform ${openIndex === i ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="bg-slate-900/40 border border-t-0 border-white/8 rounded-b-xl px-6 py-4 text-slate-400 text-sm leading-relaxed">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-24 px-4">
      <motion.div
        className="max-w-3xl mx-auto text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
      >
        <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold mb-5">
          Ready to fill your calendar?
        </motion.h2>
        <motion.p variants={fadeUp} className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
          Join sales teams already using Cadence AI to land 3× more meetings with zero manual effort.
        </motion.p>
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white text-base font-semibold px-10 h-12 gap-2">
              Start Free Trial <ArrowRight size={16} />
            </Button>
          </Link>
          <a href="mailto:sales@cadenceai.io">
            <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 text-base h-12">
              Talk to Sales
            </Button>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

function Footer() {
  const cols = [
    {
      title: "Product",
      links: [
        { label: "How it works", href: "#how-it-works" },
        { label: "Channels", href: "#channels" },
        { label: "Pricing", href: "#pricing" },
        { label: "FAQ", href: "#faq" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Contact", href: "mailto:hello@cadenceai.io" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
        { label: "Security", href: "#" },
      ],
    },
  ];

  return (
    <footer className="border-t border-white/8 pt-16 pb-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm text-white">C</div>
              <span className="font-bold text-lg text-white">Cadence AI</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              AI-powered SDR platform with a human account manager layer — built for B2B revenue teams.
            </p>
          </div>

          {/* Link columns */}
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-semibold text-sm mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-600 text-sm">
          <span>© {new Date().getFullYear()} Cadence AI. All rights reserved.</span>
          <span>Built with ♥ for B2B sales teams.</span>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────── main page ─────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main>
        <Hero />
        <LogoBar />
        <Stats />
        <HowItWorks />
        <Channels />
        <Features />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
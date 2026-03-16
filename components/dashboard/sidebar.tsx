"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const clientNav = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: "🚀" },
  { href: "/dashboard/leads", label: "Leads", icon: "👥" },
  { href: "/dashboard/onboarding", label: "Onboarding", icon: "✨" },
  { href: "/billing", label: "Billing", icon: "💳" },
];

const managerNav = [
  { href: "/manager", label: "Client Overview", icon: "📋" },
  { href: "/manager/approvals", label: "Approvals", icon: "✅" },
  { href: "/manager/campaigns", label: "All Campaigns", icon: "🚀" },
];

const adminNav = [
  { href: "/admin", label: "Admin Overview", icon: "⚡" },
  { href: "/admin/orgs", label: "Organizations", icon: "🏢" },
  { href: "/admin/billing", label: "Billing & MRR", icon: "💰" },
  { href: "/admin/queues", label: "Queue Health", icon: "⚙️" },
];

export function DashboardSidebar({ role }: { role: string }) {
  const pathname = usePathname();

  const navItems =
    role === "ADMIN"
      ? adminNav
      : role === "ACCOUNT_MANAGER"
      ? managerNav
      : clientNav;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">C</div>
          <span className="font-bold text-white text-lg">Cadence AI</span>
        </div>
        <div className="mt-2 text-xs text-slate-500 capitalize">{role.replace("_", " ").toLowerCase()}</div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
              pathname === item.href
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  );
}
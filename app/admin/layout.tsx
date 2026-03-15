import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") redirect("/dashboard");
  return (
    <div className="min-h-screen bg-slate-950 flex">
      <DashboardSidebar role="ADMIN" />
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}

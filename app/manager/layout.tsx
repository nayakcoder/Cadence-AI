import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session?.user) redirect("/login");
  if (role !== "ACCOUNT_MANAGER" && role !== "ADMIN") redirect("/dashboard");
  return (
    <div className="min-h-screen bg-slate-950 flex">
      <DashboardSidebar role={role} />
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}

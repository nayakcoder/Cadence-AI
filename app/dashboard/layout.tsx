import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <DashboardSidebar role={(session.user as any).role} />
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}

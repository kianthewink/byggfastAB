import { Sidebar } from "@/components/admin/Sidebar";
import { verifySession } from "@/lib/auth/dal";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Redirects to /administrator/logga-in if unauthenticated. Each page under
  // this group
  // also calls verifySession() itself — see lib/auth/dal.ts for why a shared
  // layout check alone isn't sufficient (it doesn't re-run on soft nav).
  const session = await verifySession();

  return (
    <div className="flex min-h-screen">
      <Sidebar email={session.email} />
      <main className="min-h-screen flex-1">{children}</main>
    </div>
  );
}

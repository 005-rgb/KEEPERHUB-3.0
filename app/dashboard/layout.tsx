import { redirect } from "next/navigation";
import { getUserFromHeaders } from "@/lib/server-auth";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import SidebarNav from "./SidebarNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = getUserFromHeaders();
  if (!auth) redirect("/login");

  const [user] = await db
    .select({ nama: users.nama, role: users.role, subscription_tier: users.subscription_tier })
    .from(users)
    .where(eq(users.id, auth.userId))
    .limit(1);

  if (!user) redirect("/login");

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
      backgroundColor: "#f3f4ff",
      backgroundImage: [
        "radial-gradient(at 5% 10%, rgba(99,102,241,0.10) 0px, transparent 55%)",
        "radial-gradient(at 95% 5%, rgba(139,92,246,0.09) 0px, transparent 50%)",
        "radial-gradient(at 85% 90%, rgba(99,102,241,0.07) 0px, transparent 50%)",
        "radial-gradient(at 15% 80%, rgba(167,139,250,0.07) 0px, transparent 50%)",
      ].join(", "),
    }}>
      <SidebarNav nama={user.nama} role={user.role} tier={user.subscription_tier} />
      <main style={{
        flex: 1,
        padding: "2rem 2.5rem",
        overflowY: "auto",
        minWidth: 0,
      }}>
        {children}
      </main>
    </div>
  );
}

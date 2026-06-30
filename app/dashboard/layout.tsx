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
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter','Segoe UI',sans-serif", background: "#f1f5f9" }}>
      <SidebarNav nama={user.nama} role={user.role} tier={user.subscription_tier} />
      <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}

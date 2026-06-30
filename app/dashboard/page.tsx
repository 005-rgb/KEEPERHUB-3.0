import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default function DashboardPage() {
  const user = getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main style={{ fontFamily: "'Inter','Segoe UI',sans-serif", padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a" }}>Dashboard</h1>
      <p style={{ color: "#64748b", marginTop: "0.5rem" }}>Selamat datang di KeeperHub.</p>
      <div style={{ marginTop: "2rem", padding: "1rem 1.25rem", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
        <p style={{ fontSize: "0.85rem", color: "#475569" }}>
          <strong>Role:</strong> {user.role} &nbsp;·&nbsp;
          <strong>Paket:</strong> {user.subscriptionTier}
        </p>
      </div>
      <form action="/api/auth/logout" method="POST" style={{ marginTop: "1.5rem" }}>
        <button type="submit" style={{
          padding: "0.5rem 1.25rem", background: "#0f172a", color: "#fff",
          border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem"
        }}>
          Keluar
        </button>
      </form>
    </main>
  );
}

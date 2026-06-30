"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const TIER_LABEL: Record<string, string> = {
  free: "Gratis",
  personal: "Personal",
  family_office: "Family Office",
  enterprise: "Enterprise",
};

const NAV = [
  { href: "/dashboard", label: "Beranda", icon: "⊞" },
  { href: "/dashboard/aset", label: "Aset Saya", icon: "🏠" },
  { href: "/dashboard/tugas", label: "Penugasan", icon: "📋" },
  { href: "/dashboard/dokumen", label: "Brankas Dokumen", icon: "🗂" },
  { href: "/dashboard/notifikasi", label: "Radar Intelijen", icon: "🎯" },
];

export default function SidebarNav({
  nama, role, tier,
}: {
  nama: string;
  role: string;
  tier: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <aside style={{
      width: 240,
      minHeight: "100vh",
      background: "#0f172a",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: "1.5rem 1.25rem 1rem", borderBottom: "1px solid #1e293b" }}>
        <div style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.3px" }}>KeeperHub</div>
        <div style={{ fontSize: "0.65rem", color: "#64748b", letterSpacing: "2px", textTransform: "uppercase", marginTop: 2 }}>
          Manajemen Aset
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: "0.625rem",
              padding: "0.55rem 0.75rem", borderRadius: 8,
              fontSize: "0.85rem", fontWeight: active ? 600 : 400,
              color: active ? "#fff" : "#94a3b8",
              background: active ? "#1e293b" : "transparent",
              textDecoration: "none", transition: "all 0.15s",
            }}>
              <span style={{ fontSize: "0.9rem" }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid #1e293b" }}>
        <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#e2e8f0", marginBottom: 2 }}>{nama}</div>
        <div style={{ fontSize: "0.72rem", color: "#64748b", marginBottom: "0.75rem" }}>
          {TIER_LABEL[tier] ?? tier} · {role}
        </div>
        <button onClick={handleLogout} style={{
          width: "100%", padding: "0.45rem", background: "#1e293b",
          color: "#94a3b8", border: "1px solid #334155", borderRadius: 6,
          fontSize: "0.78rem", cursor: "pointer",
        }}>
          Keluar
        </button>
      </div>
    </aside>
  );
}

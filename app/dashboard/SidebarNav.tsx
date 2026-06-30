"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const TIER_LABEL: Record<string, string> = {
  free: "Gratis",
  personal: "Personal",
  family_office: "Family Office",
  enterprise: "Enterprise",
};

const TIER_COLOR: Record<string, string> = {
  free: "#94a3b8",
  personal: "#6366f1",
  family_office: "#8b5cf6",
  enterprise: "#f59e0b",
};

const NAV_ALL = [
  {
    href: "/dashboard", label: "Beranda", ownerOnly: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href: "/dashboard/aset", label: "Aset Saya", ownerOnly: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: "/dashboard/tugas", label: "Penugasan", ownerOnly: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <path d="M9 12h6M9 16h4"/>
      </svg>
    ),
  },
  {
    href: "/dashboard/staf", label: "Tim Staf", ownerOnly: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
  {
    href: "/dashboard/dokumen", label: "Brankas Dokumen", ownerOnly: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
      </svg>
    ),
  },
  {
    href: "/dashboard/notifikasi", label: "Radar Intelijen", ownerOnly: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49m11.31-2.82a10 10 0 010 14.14m-14.14 0a10 10 0 010-14.14"/>
      </svg>
    ),
  },
];

export default function SidebarNav({ nama, role, tier, unreadCount = 0 }: { nama: string; role: string; tier: string; unreadCount?: number }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const tierColor = TIER_COLOR[tier] ?? "#94a3b8";

  return (
    <aside style={{
      width: 248,
      minHeight: "100vh",
      background: "linear-gradient(180deg, #0c0f1a 0%, #0f172a 60%, #111827 100%)",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      boxShadow: "4px 0 24px rgba(0,0,0,0.12)",
      position: "relative",
    }}>
      {/* Gradient accent top */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: "linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)",
      }} />

      {/* Logo */}
      <div style={{ padding: "1.5rem 1.25rem 1.25rem", marginTop: 3 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12h6v10" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1rem", color: "#fff", letterSpacing: "-0.3px" }}>KeeperHub</div>
            <div style={{ fontSize: "0.58rem", color: "#4f5d7a", letterSpacing: "1.8px", textTransform: "uppercase", marginTop: 1 }}>
              Manajemen Aset
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "linear-gradient(to right, rgba(99,102,241,0.3), transparent)", margin: "0 1.25rem" }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ALL.filter((item) => !item.ownerOnly || role === "owner").map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const isRadar = item.href === "/dashboard/notifikasi";
          const showBadge = isRadar && unreadCount > 0;
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: "0.625rem",
              padding: "0.6rem 0.875rem", borderRadius: 10,
              fontSize: "0.85rem", fontWeight: active ? 600 : 400,
              color: active ? "#fff" : "#64748b",
              background: active
                ? "linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.20) 100%)"
                : "transparent",
              textDecoration: "none",
              transition: "all 0.15s",
              borderLeft: active ? "2px solid #6366f1" : "2px solid transparent",
            }}>
              <span style={{ color: active ? "#a5b4fc" : "#4f5d7a", display: "flex" }}>
                {item.icon}
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {showBadge && (
                <span style={{
                  minWidth: 18, height: 18,
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  color: "#fff", fontSize: "0.6rem", fontWeight: 800,
                  borderRadius: 99, display: "flex", alignItems: "center",
                  justifyContent: "center", padding: "0 4px",
                  boxShadow: "0 0 0 2px rgba(15,23,42,0.6)",
                  letterSpacing: "-0.3px",
                }}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div style={{ padding: "1rem 1.25rem 1.25rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12, padding: "0.75rem",
          marginBottom: "0.75rem",
        }}>
          <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#e2e8f0", marginBottom: 3 }}>{nama}</div>
          <div style={{ fontSize: "0.7rem", color: "#4f5d7a", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{
              display: "inline-block", width: 6, height: 6, borderRadius: "50%",
              background: tierColor, boxShadow: `0 0 6px ${tierColor}`,
            }} />
            {TIER_LABEL[tier] ?? tier} · {role}
          </div>
        </div>
        <button onClick={handleLogout} style={{
          width: "100%", padding: "0.5rem",
          background: "transparent",
          color: "#4f5d7a",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 8,
          fontSize: "0.78rem", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
          transition: "all 0.15s",
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Keluar
        </button>
      </div>
    </aside>
  );
}

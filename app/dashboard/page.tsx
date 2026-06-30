import { redirect } from "next/navigation";
import { getUserFromHeaders } from "@/lib/server-auth";
import { db } from "@/server/db";
import { assets, users } from "@/server/db/schema";
import { eq, count, and, sql } from "drizzle-orm";
import { formatRupiah } from "@/lib/validations";

const KATEGORI_LABEL: Record<string, string> = {
  PROPERTY: "Properti",
  VEHICLE: "Kendaraan",
  ELECTRONIC: "Elektronik",
  LUXURY_GOODS: "Barang Mewah",
};

const KATEGORI_ICON: Record<string, string> = {
  PROPERTY: "🏠",
  VEHICLE: "🚗",
  ELECTRONIC: "💻",
  LUXURY_GOODS: "💎",
};

const TIER_LIMIT: Record<string, number> = {
  free: 3, personal: 999, family_office: 999, enterprise: 999,
};

const STAT_CARDS = [
  {
    label: "Total Aset",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    color: "#6366f1",
    bg: "rgba(99,102,241,0.08)",
  },
  {
    label: "Total Nilai Beli",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    ),
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.08)",
  },
  {
    label: "Total Perawatan",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.08)",
  },
];

export default async function DashboardPage() {
  const auth = getUserFromHeaders();
  if (!auth) redirect("/login");

  const [[user], statsRows] = await Promise.all([
    db.select({ nama: users.nama, subscription_tier: users.subscription_tier })
      .from(users).where(eq(users.id, auth.userId)).limit(1),

    db.select({
      category: assets.category,
      jumlah: count(),
      total_nilai: sql<string>`COALESCE(SUM(purchase_price), 0)`,
      total_perawatan: sql<string>`COALESCE(SUM(total_maintenance_cost), 0)`,
    })
    .from(assets)
    .where(and(eq(assets.owner_id, auth.userId), eq(assets.is_active, true)))
    .groupBy(assets.category),
  ]);

  if (!user) redirect("/login");

  const totalAset = statsRows.reduce((s, r) => s + Number(r.jumlah), 0);
  const totalNilai = statsRows.reduce((s, r) => s + Number(r.total_nilai), 0);
  const totalPerawatan = statsRows.reduce((s, r) => s + Number(r.total_perawatan), 0);
  const limit = TIER_LIMIT[user.subscription_tier] ?? 3;

  const statValues = [
    `${totalAset} / ${limit === 999 ? "∞" : limit}`,
    formatRupiah(totalNilai),
    formatRupiah(totalPerawatan),
  ];
  const statSubs = ["aset aktif", "harga perolehan", "kumulatif servis"];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginBottom: 6, letterSpacing: "-0.4px" }}>
          Selamat datang, {user.nama.split(" ")[0]} 👋
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
          Berikut ringkasan portofolio aset Anda hari ini.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {STAT_CARDS.map((c, i) => (
          <div key={c.label} style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(12px)",
            borderRadius: 16,
            padding: "1.5rem",
            border: "1px solid rgba(255,255,255,0.8)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(99,102,241,0.06)",
            position: "relative", overflow: "hidden",
          }}>
            {/* Accent top border */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 2,
              background: `linear-gradient(90deg, ${c.color}, transparent)`,
            }} />
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: c.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "0.875rem", color: c.color,
            }}>
              {c.icon}
            </div>
            <div style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px" }}>
              {c.label}
            </div>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", margin: "0.35rem 0 0.15rem", letterSpacing: "-0.5px" }}>
              {statValues[i]}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{statSubs[i]}</div>
          </div>
        ))}
      </div>

      {/* Breakdown per kategori */}
      <div style={{
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(12px)",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.8)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(99,102,241,0.06)",
        padding: "1.5rem",
        marginBottom: "1.5rem",
      }}>
        <h2 style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ color: "#6366f1" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </span>
          Breakdown per Kategori
        </h2>
        {statsRows.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📊</div>
            <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
              Belum ada aset.{" "}
              <a href="/dashboard/aset" style={{ color: "#6366f1", fontWeight: 600 }}>
                Tambah aset pertama Anda →
              </a>
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {statsRows.map((r) => (
              <div key={r.category} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "0.875rem 1rem",
                background: "rgba(99,102,241,0.03)",
                border: "1px solid rgba(99,102,241,0.08)",
                borderRadius: 12,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <span style={{ fontSize: "1.1rem" }}>{KATEGORI_ICON[r.category] ?? "📦"}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#1e293b" }}>
                      {KATEGORI_LABEL[r.category] ?? r.category}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{r.jumlah} aset</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>
                    {formatRupiah(Number(r.total_nilai))}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#94a3b8" }}>nilai beli</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paywall warning */}
      {limit !== 999 && totalAset >= limit && (
        <div style={{
          background: "linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(245,158,11,0.08) 100%)",
          border: "1px solid rgba(251,191,36,0.3)",
          borderRadius: 14, padding: "1.125rem 1.375rem",
          display: "flex", alignItems: "flex-start", gap: "0.75rem",
        }}>
          <span style={{ fontSize: "1.25rem", flexShrink: 0 }}>⚡</span>
          <div>
            <strong style={{ color: "#92400e", fontSize: "0.875rem", display: "block", marginBottom: 4 }}>
              Batas aset paket Gratis tercapai ({limit} aset)
            </strong>
            <p style={{ color: "#a16207", fontSize: "0.8rem", margin: 0 }}>
              Upgrade paket untuk menambah aset lebih banyak dan mengaktifkan Radar Intelijen.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

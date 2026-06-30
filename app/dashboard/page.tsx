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

const TIER_LIMIT: Record<string, number> = {
  free: 3, personal: 999, family_office: 999, enterprise: 999,
};

export default async function DashboardPage() {
  const auth = getUserFromHeaders();
  if (!auth) redirect("/login");

  // Paralel: ambil data user + statistik aset
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

  return (
    <div>
      <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
        Selamat datang, {user.nama.split(" ")[0]}
      </h1>
      <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "2rem" }}>
        Berikut ringkasan portofolio aset Anda hari ini.
      </p>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Total Aset", value: `${totalAset} / ${limit === 999 ? "∞" : limit}`, sub: "aset aktif" },
          { label: "Total Nilai Beli", value: formatRupiah(totalNilai), sub: "harga perolehan" },
          { label: "Total Biaya Perawatan", value: formatRupiah(totalPerawatan), sub: "kumulatif servis" },
        ].map((c) => (
          <div key={c.label} style={{
            background: "#fff", borderRadius: 12, padding: "1.25rem",
            border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}>
            <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {c.label}
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", margin: "0.4rem 0 0.15rem" }}>
              {c.value}
            </div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Breakdown per kategori */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "1.25rem", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a", marginBottom: "1rem" }}>
          Breakdown per Kategori
        </h2>
        {statsRows.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
            Belum ada aset. <a href="/dashboard/aset" style={{ color: "#0f172a", fontWeight: 600 }}>Tambah aset pertama Anda →</a>
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {statsRows.map((r) => (
              <div key={r.category} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.65rem 0.875rem", background: "#f8fafc", borderRadius: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#1e293b" }}>
                    {KATEGORI_LABEL[r.category] ?? r.category}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{r.jumlah} aset</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#0f172a" }}>
                    {formatRupiah(Number(r.total_nilai))}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>nilai beli</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paywall warning */}
      {limit !== 999 && totalAset >= limit && (
        <div style={{ background: "#fefce8", border: "1px solid #fde047", borderRadius: 10, padding: "1rem 1.25rem" }}>
          <strong style={{ color: "#854d0e", fontSize: "0.85rem" }}>⚠️ Batas aset paket Gratis tercapai ({limit} aset).</strong>
          <p style={{ color: "#a16207", fontSize: "0.8rem", margin: "0.25rem 0 0" }}>
            Upgrade paket untuk menambah aset lebih banyak dan mengaktifkan Radar Intelijen.
          </p>
        </div>
      )}
    </div>
  );
}

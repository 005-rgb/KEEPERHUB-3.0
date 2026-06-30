import { redirect } from "next/navigation";
import { getUserFromHeaders } from "@/lib/server-auth";
import { db } from "@/server/db";
import { assets } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { formatRupiah, formatTanggalPendek } from "@/lib/validations";
import TambahAsetForm from "./TambahAsetForm";

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

const KATEGORI_GRADIENT: Record<string, string> = {
  PROPERTY: "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.06) 100%)",
  VEHICLE: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(6,182,212,0.06) 100%)",
  ELECTRONIC: "linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(139,92,246,0.06) 100%)",
  LUXURY_GOODS: "linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(239,68,68,0.06) 100%)",
};

const KATEGORI_ACCENT: Record<string, string> = {
  PROPERTY: "#6366f1",
  VEHICLE: "#10b981",
  ELECTRONIC: "#ec4899",
  LUXURY_GOODS: "#f59e0b",
};

export default async function AsetPage() {
  const auth = getUserFromHeaders();
  if (!auth) redirect("/login");

  const daftarAset = await db
    .select()
    .from(assets)
    .where(and(eq(assets.owner_id, auth.userId), eq(assets.is_active, true)))
    .orderBy(assets.created_at);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginBottom: 6, letterSpacing: "-0.4px" }}>
            Aset Saya
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
            {daftarAset.length} aset aktif terdaftar
          </p>
        </div>
        <TambahAsetForm />
      </div>

      {daftarAset.length === 0 ? (
        <div style={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(12px)",
          borderRadius: 20,
          border: "2px dashed rgba(99,102,241,0.2)",
          padding: "4rem 2rem",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📦</div>
          <p style={{ color: "#475569", fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            Belum ada aset yang didaftarkan
          </p>
          <p style={{ color: "#94a3b8", fontSize: "0.82rem" }}>
            Klik <strong style={{ color: "#6366f1" }}>+ Tambah Aset</strong> untuk mulai mencatat aset Anda.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
          {daftarAset.map((aset) => {
            const lemonLaw = aset.purchase_price && aset.total_maintenance_cost
              ? (Number(aset.total_maintenance_cost) / Number(aset.purchase_price)) * 100
              : 0;
            const accent = KATEGORI_ACCENT[aset.category] ?? "#6366f1";
            const gradient = KATEGORI_GRADIENT[aset.category] ?? "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, transparent 100%)";

            return (
              <div key={aset.id} style={{
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(12px)",
                borderRadius: 18,
                border: lemonLaw >= 30 ? "1.5px solid rgba(239,68,68,0.3)" : "1px solid rgba(255,255,255,0.8)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04), 0 8px 32px rgba(99,102,241,0.07)",
                overflow: "hidden",
              }}>
                {/* Top gradient strip */}
                <div style={{ height: 4, background: `linear-gradient(90deg, ${accent}, transparent)` }} />

                <div style={{ padding: "1.25rem" }}>
                  {/* Badge + alert row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.875rem" }}>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: "0.35rem",
                      fontSize: "0.68rem", fontWeight: 700,
                      padding: "0.3rem 0.65rem", borderRadius: 99,
                      background: gradient,
                      color: accent, textTransform: "uppercase", letterSpacing: "0.5px",
                      border: `1px solid ${accent}22`,
                    }}>
                      <span>{KATEGORI_ICON[aset.category]}</span>
                      {KATEGORI_LABEL[aset.category] ?? aset.category}
                    </div>
                    {lemonLaw >= 30 && (
                      <span style={{
                        fontSize: "0.68rem", color: "#dc2626", fontWeight: 700,
                        background: "rgba(239,68,68,0.08)", padding: "0.3rem 0.6rem",
                        borderRadius: 99, border: "1px solid rgba(239,68,68,0.2)",
                      }}>
                        🔴 Boncos
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontWeight: 700, fontSize: "1.05rem", color: "#0f172a", margin: "0 0 0.3rem" }}>{aset.nama}</h3>
                  {aset.deskripsi && (
                    <p style={{ fontSize: "0.78rem", color: "#64748b", margin: "0 0 0.875rem", lineHeight: 1.5 }}>{aset.deskripsi}</p>
                  )}

                  {/* Stats */}
                  <div style={{
                    display: "flex", flexDirection: "column", gap: "0.4rem",
                    marginTop: "0.875rem",
                    padding: "0.875rem",
                    background: "rgba(99,102,241,0.025)",
                    borderRadius: 12,
                    border: "1px solid rgba(99,102,241,0.06)",
                  }}>
                    <Row label="Harga Beli" value={formatRupiah(Number(aset.purchase_price))} />
                    {aset.current_value && (
                      <Row label="Nilai Saat Ini" value={formatRupiah(Number(aset.current_value))} />
                    )}
                    <Row label="Total Perawatan" value={formatRupiah(Number(aset.total_maintenance_cost))} />
                    {aset.purchase_date && (
                      <Row label="Tgl Beli" value={formatTanggalPendek(aset.purchase_date)} />
                    )}
                    {aset.taxation_deadline && (
                      <Row label="Deadline Pajak" value={formatTanggalPendek(aset.taxation_deadline)} alert />
                    )}
                    {aset.warranty_end_date && (
                      <Row label="Garansi Berakhir" value={formatTanggalPendek(aset.warranty_end_date)} />
                    )}
                  </div>

                  {lemonLaw > 0 && (
                    <div style={{
                      marginTop: "0.875rem", padding: "0.6rem 0.875rem",
                      background: lemonLaw >= 30 ? "rgba(239,68,68,0.06)" : "rgba(99,102,241,0.04)",
                      borderRadius: 10, border: `1px solid ${lemonLaw >= 30 ? "rgba(239,68,68,0.15)" : "rgba(99,102,241,0.08)"}`,
                    }}>
                      <div style={{ fontSize: "0.72rem", color: lemonLaw >= 30 ? "#dc2626" : "#6366f1", fontWeight: 600 }}>
                        ⚖ Lemon Law: {lemonLaw.toFixed(1).replace(".", ",")}%
                        {lemonLaw >= 30 && " — Biaya perawatan melebihi 30% harga beli!"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
      <span style={{ color: "#94a3b8" }}>{label}</span>
      <span style={{ fontWeight: 600, color: alert ? "#dc2626" : "#1e293b" }}>{value}</span>
    </div>
  );
}

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

const KATEGORI_WARNA: Record<string, string> = {
  PROPERTY: "#dbeafe",
  VEHICLE: "#dcfce7",
  ELECTRONIC: "#fce7f3",
  LUXURY_GOODS: "#fef9c3",
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Aset Saya</h1>
          <p style={{ color: "#64748b", fontSize: "0.85rem" }}>{daftarAset.length} aset aktif</p>
        </div>
        <TambahAsetForm />
      </div>

      {daftarAset.length === 0 ? (
        <div style={{
          background: "#fff", borderRadius: 12, border: "2px dashed #e2e8f0",
          padding: "3rem", textAlign: "center",
        }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📦</div>
          <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "0.5rem" }}>Belum ada aset yang didaftarkan.</p>
          <p style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Klik <strong>+ Tambah Aset</strong> untuk mulai mencatat aset Anda.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {daftarAset.map((aset) => {
            const lemonLaw = aset.purchase_price && aset.total_maintenance_cost
              ? (Number(aset.total_maintenance_cost) / Number(aset.purchase_price)) * 100
              : 0;

            return (
              <div key={aset.id} style={{
                background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
                padding: "1.25rem", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}>
                {/* Badge kategori */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <span style={{
                    fontSize: "0.7rem", fontWeight: 700, padding: "0.25rem 0.6rem",
                    borderRadius: 99, background: KATEGORI_WARNA[aset.category] ?? "#f1f5f9",
                    color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.5px",
                  }}>
                    {KATEGORI_LABEL[aset.category] ?? aset.category}
                  </span>
                  {lemonLaw >= 30 && (
                    <span style={{ fontSize: "0.7rem", color: "#dc2626", fontWeight: 700 }}>🔴 Boncos</span>
                  )}
                </div>

                <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a", margin: "0 0 0.25rem" }}>{aset.nama}</h3>
                {aset.deskripsi && (
                  <p style={{ fontSize: "0.78rem", color: "#64748b", margin: "0 0 0.75rem" }}>{aset.deskripsi}</p>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginTop: "0.75rem" }}>
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
                  <div style={{ marginTop: "0.875rem", padding: "0.5rem 0.75rem", background: lemonLaw >= 30 ? "#fef2f2" : "#f8fafc", borderRadius: 8 }}>
                    <div style={{ fontSize: "0.72rem", color: lemonLaw >= 30 ? "#dc2626" : "#64748b", fontWeight: 600 }}>
                      Lemon Law: {lemonLaw.toFixed(1).replace(".", ",")}%
                      {lemonLaw >= 30 && " — Biaya perawatan melebihi 30% harga beli!"}
                    </div>
                  </div>
                )}
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
      <span style={{ color: "#64748b" }}>{label}</span>
      <span style={{ fontWeight: 600, color: alert ? "#dc2626" : "#1e293b" }}>{value}</span>
    </div>
  );
}

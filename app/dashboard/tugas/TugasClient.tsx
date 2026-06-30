"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah, formatTanggalPendek } from "@/lib/validations";
import BuatTugasForm from "./BuatTugasForm";
import AksiTugasModal from "./AksiTugasModal";

const STATUS_LABEL: Record<string, string> = {
  ditugaskan: "Ditugaskan",
  menunggu_persetujuan: "Menunggu Persetujuan",
  disetujui: "Disetujui",
  ditolak: "Ditolak",
  selesai: "Selesai",
};

const STATUS_WARNA: Record<string, { bg: string; text: string }> = {
  ditugaskan: { bg: "#dbeafe", text: "#1d4ed8" },
  menunggu_persetujuan: { bg: "#fef3c7", text: "#b45309" },
  disetujui: { bg: "#dcfce7", text: "#16a34a" },
  ditolak: { bg: "#fee2e2", text: "#dc2626" },
  selesai: { bg: "#f1f5f9", text: "#475569" },
};

const SERVICE_LABEL: Record<string, string> = {
  ROUTINE_SCHEDULED: "Servis Rutin",
  REPAIR_BREAKDOWN: "Perbaikan Kerusakan",
  CLEANING_DETAILING: "Cuci & Detailing",
  UPGRADE_MODIFICATION: "Upgrade / Modifikasi",
  INSPECTION_CERTIFICATION: "Inspeksi & Sertifikasi",
};

const TABS = [
  { key: "semua", label: "Semua" },
  { key: "ditugaskan", label: "Ditugaskan" },
  { key: "menunggu_persetujuan", label: "Menunggu Persetujuan" },
  { key: "disetujui", label: "Disetujui" },
  { key: "ditolak", label: "Ditolak" },
  { key: "selesai", label: "Selesai" },
];

type Tugas = {
  id: string;
  judul: string;
  deskripsi: string | null;
  service_type: string;
  status: string;
  due_date: string | null;
  submitted_cost: string | null;
  approved_cost: string | null;
  staff_notes: string | null;
  owner_notes: string | null;
  magic_link_token: string | null;
  created_at: Date;
  asset_id: string;
  asset_nama: string | null;
  asset_category: string | null;
  assigned_to: string;
  staf_nama: string | null;
  staf_phone: string | null;
};

export default function TugasClient({
  tugasList, role, ownerId,
}: {
  tugasList: Tugas[];
  role: string;
  ownerId: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState("semua");
  const [selected, setSelected] = useState<Tugas | null>(null);

  const filtered = tab === "semua" ? tugasList : tugasList.filter((t) => t.status === tab);

  const badgeCount = (key: string) => key === "semua"
    ? tugasList.length
    : tugasList.filter((t) => t.status === key).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Penugasan</h1>
          <p style={{ color: "#64748b", fontSize: "0.85rem" }}>{tugasList.length} tugas total</p>
        </div>
        {role === "owner" && (
          <BuatTugasForm onSuccess={() => router.refresh()} />
        )}
      </div>

      {/* Tab filter */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {TABS.map((t) => {
          const count = badgeCount(t.key);
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: "0.4rem 0.875rem",
              borderRadius: 99,
              fontSize: "0.78rem",
              fontWeight: active ? 700 : 500,
              border: active ? "none" : "1px solid #e2e8f0",
              background: active ? "#0f172a" : "#fff",
              color: active ? "#fff" : "#64748b",
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: "0.35rem",
            }}>
              {t.label}
              {count > 0 && (
                <span style={{
                  background: active ? "rgba(255,255,255,0.2)" : "#f1f5f9",
                  color: active ? "#fff" : "#475569",
                  borderRadius: 99, padding: "0 0.4rem",
                  fontSize: "0.7rem", fontWeight: 700,
                }}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* List tugas */}
      {filtered.length === 0 ? (
        <div style={{
          background: "#fff", borderRadius: 12, border: "2px dashed #e2e8f0",
          padding: "3rem", textAlign: "center",
        }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📋</div>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Belum ada tugas di kategori ini.</p>
          {role === "owner" && tab === "semua" && (
            <p style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: "0.25rem" }}>
              Klik <strong>+ Buat Tugas</strong> untuk menugaskan staf mengerjakan aset Anda.
            </p>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filtered.map((tugas) => {
            const warna = STATUS_WARNA[tugas.status] ?? { bg: "#f1f5f9", text: "#475569" };
            const isMenunggu = tugas.status === "menunggu_persetujuan";
            return (
              <div key={tugas.id} style={{
                background: "#fff", borderRadius: 12,
                border: isMenunggu ? "1.5px solid #fde047" : "1px solid #e2e8f0",
                padding: "1.125rem 1.25rem",
                cursor: "pointer",
                transition: "box-shadow 0.15s",
              }}
                onClick={() => setSelected(tugas)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                      <span style={{
                        fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.55rem",
                        borderRadius: 99, background: warna.bg, color: warna.text,
                        whiteSpace: "nowrap",
                      }}>
                        {STATUS_LABEL[tugas.status]}
                      </span>
                      {isMenunggu && <span style={{ fontSize: "0.7rem", color: "#b45309", fontWeight: 700 }}>⚡ Perlu tindakan</span>}
                    </div>
                    <h3 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a", margin: 0 }}>{tugas.judul}</h3>
                    <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.25rem" }}>
                      {tugas.asset_nama ?? "—"} · {SERVICE_LABEL[tugas.service_type] ?? tugas.service_type}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "0.78rem", color: "#64748b" }}>Staf: <strong>{tugas.staf_nama ?? "—"}</strong></div>
                    {tugas.due_date && (
                      <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 2 }}>
                        Jatuh tempo: {formatTanggalPendek(tugas.due_date)}
                      </div>
                    )}
                    {tugas.submitted_cost && (
                      <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
                        {formatRupiah(Number(tugas.submitted_cost))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal detail & aksi */}
      {selected && (
        <AksiTugasModal
          tugas={selected}
          role={role}
          ownerId={ownerId}
          onClose={() => setSelected(null)}
          onSuccess={() => { setSelected(null); router.refresh(); }}
        />
      )}
    </div>
  );
}

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

const STATUS_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  ditugaskan: { bg: "rgba(99,102,241,0.08)", text: "#6366f1", border: "rgba(99,102,241,0.2)" },
  menunggu_persetujuan: { bg: "rgba(245,158,11,0.08)", text: "#d97706", border: "rgba(245,158,11,0.2)" },
  disetujui: { bg: "rgba(16,185,129,0.08)", text: "#059669", border: "rgba(16,185,129,0.2)" },
  ditolak: { bg: "rgba(239,68,68,0.08)", text: "#dc2626", border: "rgba(239,68,68,0.2)" },
  selesai: { bg: "rgba(100,116,139,0.08)", text: "#475569", border: "rgba(100,116,139,0.2)" },
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
  { key: "menunggu_persetujuan", label: "Menunggu" },
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

export default function TugasClient({ tugasList, role, ownerId }: { tugasList: Tugas[]; role: string; ownerId: string }) {
  const router = useRouter();
  const [tab, setTab] = useState("semua");
  const [selected, setSelected] = useState<Tugas | null>(null);

  const filtered = tab === "semua" ? tugasList : tugasList.filter((t) => t.status === tab);
  const badgeCount = (key: string) => key === "semua" ? tugasList.length : tugasList.filter((t) => t.status === key).length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginBottom: 6, letterSpacing: "-0.4px" }}>
            Penugasan
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>{tugasList.length} tugas total</p>
        </div>
        {role === "owner" && (
          <BuatTugasForm onSuccess={() => router.refresh()} />
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.375rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {TABS.map((t) => {
          const count = badgeCount(t.key);
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: "0.45rem 0.875rem",
              borderRadius: 99,
              fontSize: "0.78rem", fontWeight: active ? 700 : 500,
              border: active ? "none" : "1.5px solid #e2e8f0",
              background: active ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" : "rgba(255,255,255,0.8)",
              color: active ? "#fff" : "#64748b",
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: "0.35rem",
              boxShadow: active ? "0 4px 10px rgba(99,102,241,0.25)" : "none",
              transition: "all 0.15s",
            }}>
              {t.label}
              {count > 0 && (
                <span style={{
                  background: active ? "rgba(255,255,255,0.25)" : "#f1f5f9",
                  color: active ? "#fff" : "#475569",
                  borderRadius: 99, padding: "0 0.45rem",
                  fontSize: "0.68rem", fontWeight: 700, minWidth: 18, textAlign: "center",
                }}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(12px)",
          borderRadius: 20,
          border: "2px dashed rgba(99,102,241,0.2)",
          padding: "4rem 2rem", textAlign: "center",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
          <p style={{ color: "#475569", fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            Belum ada tugas di kategori ini
          </p>
          {role === "owner" && tab === "semua" && (
            <p style={{ color: "#94a3b8", fontSize: "0.82rem" }}>
              Klik <strong style={{ color: "#6366f1" }}>+ Buat Tugas</strong> untuk menugaskan staf mengerjakan aset Anda.
            </p>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filtered.map((tugas) => {
            const st = STATUS_STYLE[tugas.status] ?? STATUS_STYLE.selesai;
            const isMenunggu = tugas.status === "menunggu_persetujuan";
            return (
              <div key={tugas.id}
                onClick={() => setSelected(tugas)}
                style={{
                  background: "rgba(255,255,255,0.92)",
                  backdropFilter: "blur(12px)",
                  borderRadius: 16,
                  border: isMenunggu ? "1.5px solid rgba(245,158,11,0.35)" : "1px solid rgba(255,255,255,0.8)",
                  padding: "1.125rem 1.375rem",
                  cursor: "pointer",
                  boxShadow: isMenunggu
                    ? "0 4px 20px rgba(245,158,11,0.10)"
                    : "0 2px 8px rgba(0,0,0,0.03), 0 4px 16px rgba(99,102,241,0.05)",
                  transition: "transform 0.15s, box-shadow 0.15s",
                  position: "relative", overflow: "hidden",
                }}>
                {/* Left accent bar */}
                <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
                  background: st.text,
                  borderRadius: "0 3px 3px 0",
                }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                  <div style={{ flex: 1, paddingLeft: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
                      <span style={{
                        fontSize: "0.68rem", fontWeight: 700, padding: "0.25rem 0.6rem",
                        borderRadius: 99, background: st.bg, color: st.text,
                        border: `1px solid ${st.border}`, whiteSpace: "nowrap",
                      }}>
                        {STATUS_LABEL[tugas.status]}
                      </span>
                      {isMenunggu && (
                        <span style={{
                          fontSize: "0.68rem", color: "#d97706", fontWeight: 700,
                          background: "rgba(245,158,11,0.08)", padding: "0.25rem 0.5rem",
                          borderRadius: 99,
                        }}>
                          ⚡ Perlu tindakan
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a", margin: "0 0 0.25rem" }}>{tugas.judul}</h3>
                    <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                      {tugas.asset_nama ?? "—"} · {SERVICE_LABEL[tugas.service_type] ?? tugas.service_type}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                      Staf: <strong style={{ color: "#1e293b" }}>{tugas.staf_nama ?? "—"}</strong>
                    </div>
                    {tugas.due_date && (
                      <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: 2 }}>
                        Jatuh tempo: {formatTanggalPendek(tugas.due_date)}
                      </div>
                    )}
                    {tugas.submitted_cost && (
                      <div style={{
                        fontSize: "0.82rem", fontWeight: 700,
                        color: "#6366f1", marginTop: 4,
                      }}>
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

      {selected && (
        <AksiTugasModal
          tugas={selected} role={role} ownerId={ownerId}
          onClose={() => setSelected(null)}
          onSuccess={() => { setSelected(null); router.refresh(); }}
        />
      )}
    </div>
  );
}

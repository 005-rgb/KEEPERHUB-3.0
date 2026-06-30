"use client";
import { useState } from "react";
import { formatRupiah, formatTanggalPendek } from "@/lib/validations";

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
  ROUTINE_SCHEDULED: "Servis Rutin Terjadwal",
  REPAIR_BREAKDOWN: "Perbaikan Kerusakan",
  CLEANING_DETAILING: "Cuci & Detailing",
  UPGRADE_MODIFICATION: "Upgrade / Modifikasi",
  INSPECTION_CERTIFICATION: "Inspeksi & Sertifikasi",
};

type Tugas = {
  id: string; judul: string; deskripsi: string | null;
  service_type: string; status: string; due_date: string | null;
  submitted_cost: string | null; approved_cost: string | null;
  staff_notes: string | null; owner_notes: string | null;
  magic_link_token: string | null; created_at: Date;
  asset_id: string; asset_nama: string | null; asset_category: string | null;
  assigned_to: string; staf_nama: string | null; staf_phone: string | null;
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.6rem 0.75rem",
  border: "1.5px solid #e2e8f0", borderRadius: 8,
  fontSize: "0.85rem", outline: "none", boxSizing: "border-box",
};

export default function AksiTugasModal({
  tugas, role, ownerId, onClose, onSuccess,
}: {
  tugas: Tugas; role: string; ownerId: string;
  onClose: () => void; onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submittedCost, setSubmittedCost] = useState("");
  const [staffNotes, setStaffNotes] = useState("");
  const [approvedCost, setApprovedCost] = useState(tugas.submitted_cost ?? "");
  const [ownerNotes, setOwnerNotes] = useState("");

  const isOwner = role === "owner";
  const isStaf = role === "staff" || tugas.assigned_to === ownerId;
  const warna = STATUS_WARNA[tugas.status] ?? { bg: "#f1f5f9", text: "#475569" };

  async function kirimAksi(aksi: string, extra: Record<string, any> = {}) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/tugas/${tugas.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aksi, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.pesan || "Terjadi kesalahan.");
      } else {
        onSuccess();
      }
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: "1rem",
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: "2rem",
        width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
          <div>
            <span style={{
              fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.55rem",
              borderRadius: 99, background: warna.bg, color: warna.text,
            }}>
              {STATUS_LABEL[tugas.status]}
            </span>
            <h2 style={{ fontWeight: 700, fontSize: "1.05rem", color: "#0f172a", margin: "0.5rem 0 0" }}>{tugas.judul}</h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#64748b", flexShrink: 0 }}>✕</button>
        </div>

        {/* Info tugas */}
        <div style={{ background: "#f8fafc", borderRadius: 10, padding: "0.875rem", marginBottom: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <InfoRow label="Aset" value={tugas.asset_nama ?? "—"} />
          <InfoRow label="Jenis Servis" value={SERVICE_LABEL[tugas.service_type] ?? tugas.service_type} />
          <InfoRow label="Staf" value={tugas.staf_nama ?? "—"} />
          {tugas.due_date && <InfoRow label="Jatuh Tempo" value={formatTanggalPendek(tugas.due_date)} />}
          {tugas.deskripsi && (
            <div>
              <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>Instruksi</div>
              <div style={{ fontSize: "0.82rem", color: "#1e293b", marginTop: 2, whiteSpace: "pre-line" }}>{tugas.deskripsi}</div>
            </div>
          )}
        </div>

        {/* Biaya yang diajukan staf */}
        {tugas.submitted_cost && (
          <div style={{ background: "#fef9c3", border: "1px solid #fde047", borderRadius: 10, padding: "0.875rem", marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.72rem", color: "#854d0e", fontWeight: 700, marginBottom: "0.35rem" }}>💰 Biaya Diajukan Staf</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#854d0e" }}>{formatRupiah(Number(tugas.submitted_cost))}</div>
            {tugas.staff_notes && <div style={{ fontSize: "0.78rem", color: "#92400e", marginTop: "0.35rem" }}>{tugas.staff_notes}</div>}
          </div>
        )}

        {/* Biaya yang disetujui */}
        {tugas.approved_cost && tugas.status !== "menunggu_persetujuan" && (
          <div style={{ background: "#dcfce7", border: "1px solid #86efac", borderRadius: 10, padding: "0.875rem", marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.72rem", color: "#16a34a", fontWeight: 700, marginBottom: "0.35rem" }}>✅ Biaya Disetujui</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#16a34a" }}>{formatRupiah(Number(tugas.approved_cost))}</div>
          </div>
        )}

        {/* Catatan owner */}
        {tugas.owner_notes && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "0.875rem", marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.72rem", color: "#dc2626", fontWeight: 700, marginBottom: 3 }}>📝 Catatan Owner</div>
            <div style={{ fontSize: "0.82rem", color: "#991b1b" }}>{tugas.owner_notes}</div>
          </div>
        )}

        {/* ── AKSI: STAF submit selesai ─────────────────────────── */}
        {(tugas.status === "ditugaskan" || tugas.status === "ditolak") && isOwner && (
          <div style={{ border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "1rem", marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.75rem" }}>
              Submit Selesai (Ajukan Biaya)
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#374151", marginBottom: 3 }}>
                  Biaya yang Diajukan (Rp) *
                </label>
                <input type="number" min="0" value={submittedCost}
                  onChange={(e) => setSubmittedCost(e.target.value)}
                  placeholder="Contoh: 2500000" style={inputStyle} />
                {submittedCost && (
                  <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: 2 }}>
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(submittedCost))}
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#374151", marginBottom: 3 }}>Catatan (opsional)</label>
                <textarea value={staffNotes} onChange={(e) => setStaffNotes(e.target.value)}
                  placeholder="Detail pekerjaan yang dilakukan..."
                  style={{ ...inputStyle, minHeight: 60, resize: "vertical", fontFamily: "inherit" }} />
              </div>
              <button disabled={loading || !submittedCost}
                onClick={() => kirimAksi("submit_selesai", { submitted_cost: Number(submittedCost), staff_notes: staffNotes })}
                style={{
                  padding: "0.65rem", background: (!submittedCost || loading) ? "#94a3b8" : "#1d4ed8",
                  color: "#fff", border: "none", borderRadius: 8, fontSize: "0.85rem",
                  fontWeight: 600, cursor: (!submittedCost || loading) ? "not-allowed" : "pointer",
                }}>
                {loading ? "Mengirim..." : "Ajukan ke Owner"}
              </button>
            </div>
          </div>
        )}

        {/* ── AKSI: OWNER setujui / tolak ──────────────────────── */}
        {tugas.status === "menunggu_persetujuan" && isOwner && (
          <div style={{ border: "1.5px solid #fde047", borderRadius: 10, padding: "1rem", marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.75rem" }}>
              ⚡ Tinjauan Persetujuan
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#374151", marginBottom: 3 }}>
                  Biaya Disetujui (Rp) — kosongkan jika setuju penuh
                </label>
                <input type="number" min="0" value={approvedCost}
                  onChange={(e) => setApprovedCost(e.target.value)}
                  placeholder={tugas.submitted_cost ?? ""} style={inputStyle} />
                {approvedCost && (
                  <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: 2 }}>
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(approvedCost))}
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#374151", marginBottom: 3 }}>
                  Catatan / Alasan (wajib jika menolak)
                </label>
                <textarea value={ownerNotes} onChange={(e) => setOwnerNotes(e.target.value)}
                  placeholder="Catatan untuk staf..."
                  style={{ ...inputStyle, minHeight: 60, resize: "vertical", fontFamily: "inherit" }} />
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button disabled={loading || !ownerNotes}
                  onClick={() => kirimAksi("tolak", { owner_notes: ownerNotes })}
                  style={{
                    flex: 1, padding: "0.65rem",
                    background: (loading || !ownerNotes) ? "#fee2e2" : "#fef2f2",
                    color: "#dc2626", border: "1.5px solid #fca5a5",
                    borderRadius: 8, fontSize: "0.85rem", fontWeight: 700,
                    cursor: (loading || !ownerNotes) ? "not-allowed" : "pointer",
                  }}>
                  Tolak
                </button>
                <button disabled={loading}
                  onClick={() => kirimAksi("setujui", { approved_cost: approvedCost || tugas.submitted_cost, owner_notes: ownerNotes })}
                  style={{
                    flex: 2, padding: "0.65rem", background: loading ? "#94a3b8" : "#16a34a",
                    color: "#fff", border: "none", borderRadius: 8,
                    fontSize: "0.85rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                  }}>
                  {loading ? "Memproses..." : "✅ Setujui"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── AKSI: OWNER selesaikan ───────────────────────────── */}
        {tugas.status === "disetujui" && isOwner && (
          <div style={{ border: "1.5px solid #86efac", borderRadius: 10, padding: "1rem", marginBottom: "1rem" }}>
            <p style={{ fontSize: "0.82rem", color: "#166534", marginBottom: "0.75rem" }}>
              Tandai tugas ini sebagai selesai. Biaya disetujui akan ditambahkan ke total perawatan aset.
            </p>
            <button disabled={loading}
              onClick={() => kirimAksi("selesaikan")}
              style={{
                width: "100%", padding: "0.65rem",
                background: loading ? "#94a3b8" : "#0f172a",
                color: "#fff", border: "none", borderRadius: 8,
                fontSize: "0.85rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              }}>
              {loading ? "Memproses..." : "🏁 Tandai Selesai"}
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "0.65rem", fontSize: "0.82rem", color: "#dc2626", marginBottom: "0.75rem" }}>
            {error}
          </div>
        )}

        {/* Magic link info */}
        {tugas.magic_link_token && tugas.status !== "selesai" && isOwner && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.65rem", fontSize: "0.75rem", color: "#166534" }}>
            🔗 <strong>Magic link staf:</strong>{" "}
            <span style={{ wordBreak: "break-all", fontFamily: "monospace" }}>
              /tugas/{tugas.magic_link_token}
            </span>
            {" "}(kirim via WhatsApp ke {tugas.staf_phone ?? "staf"})
          </div>
        )}

        <button onClick={onClose} style={{
          marginTop: "1rem", width: "100%", padding: "0.6rem",
          background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 8,
          fontSize: "0.82rem", color: "#475569", cursor: "pointer",
        }}>
          Tutup
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
      <span style={{ color: "#64748b" }}>{label}</span>
      <span style={{ fontWeight: 600, color: "#1e293b" }}>{value}</span>
    </div>
  );
}

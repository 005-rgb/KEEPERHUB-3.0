"use client";
import { useState, useEffect } from "react";

const JENIS_SERVIS = [
  { value: "ROUTINE_SCHEDULED", label: "Servis Rutin Terjadwal" },
  { value: "REPAIR_BREAKDOWN", label: "Perbaikan Kerusakan" },
  { value: "CLEANING_DETAILING", label: "Cuci & Detailing" },
  { value: "UPGRADE_MODIFICATION", label: "Upgrade / Modifikasi" },
  { value: "INSPECTION_CERTIFICATION", label: "Inspeksi & Sertifikasi" },
];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.65rem 0.875rem",
  border: "1.5px solid #e2e8f0", borderRadius: 10,
  fontSize: "0.875rem", outline: "none", boxSizing: "border-box",
  background: "#fff", color: "#0f172a", fontFamily: "inherit",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.75rem", fontWeight: 600,
  color: "#374151", marginBottom: "0.35rem",
};

const EMPTY = { asset_id: "", assigned_to: "", service_type: "", judul: "", deskripsi: "", due_date: "" };

type Aset = { id: string; nama: string; category: string };
type Staf = { id: string; nama: string; phone: string | null; email: string | null };

const CATEGORY_LABEL: Record<string, string> = {
  PROPERTY: "🏠 Properti",
  VEHICLE: "🚗 Kendaraan",
  ELECTRONIC: "💻 Elektronik",
  LUXURY_GOODS: "💎 Barang Mewah",
};

export default function BuatTugasForm({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [asetList, setAsetList] = useState<Aset[]>([]);
  const [stafList, setStafList] = useState<Staf[]>([]);
  const [fetching, setFetching] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setFetching(true);
    Promise.all([
      fetch("/api/assets").then((r) => r.json()),
      fetch("/api/staf").then((r) => r.json()),
    ]).then(([asetRes, stafRes]) => {
      setAsetList(asetRes.data ?? []);
      setStafList(stafRes.data ?? []);
    }).finally(() => setFetching(false));
  }, [open]);

  const focusStyle = (field: string): React.CSSProperties => ({
    ...inputStyle,
    borderColor: focused === field ? "#6366f1" : "#e2e8f0",
    boxShadow: focused === field ? "0 0 0 3px rgba(99,102,241,0.1)" : "none",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tugas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.pesan || "Terjadi kesalahan.");
      } else {
        setOpen(false);
        setForm(EMPTY);
        onSuccess();
      }
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = !loading && asetList.length > 0 && stafList.length > 0;

  return (
    <>
      <button onClick={() => setOpen(true)} style={{
        padding: "0.65rem 1.25rem",
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        color: "#fff", border: "none", borderRadius: 12,
        fontSize: "0.875rem", fontWeight: 700, cursor: "pointer",
        boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
        display: "flex", alignItems: "center", gap: "0.4rem",
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Buat Tugas
      </button>

      {open && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "1rem",
        }}>
          <div style={{
            background: "#fff", borderRadius: 20, padding: "2rem",
            width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 25px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(99,102,241,0.1)",
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: "1.1rem", color: "#0f172a", letterSpacing: "-0.3px" }}>Buat Tugas Baru</h2>
                <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}>Tugaskan pekerjaan ke staf Anda</p>
              </div>
              <button onClick={() => { setOpen(false); setError(""); setForm(EMPTY); }} style={{
                background: "#f1f5f9", border: "none", width: 32, height: 32,
                borderRadius: 8, cursor: "pointer", color: "#64748b",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem",
              }}>✕</button>
            </div>

            {fetching ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>⏳</div>
                Memuat data aset & staf...
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>

                {/* Aset */}
                <div>
                  <label style={labelStyle}>Aset yang Diservis *</label>
                  {asetList.length === 0 ? (
                    <div style={{
                      padding: "0.875rem", background: "rgba(245,158,11,0.06)",
                      borderRadius: 10, fontSize: "0.8rem", color: "#854d0e",
                      border: "1px solid rgba(245,158,11,0.2)",
                    }}>
                      ⚠ Belum ada aset. Tambah di menu <strong>Aset Saya</strong> terlebih dahulu.
                    </div>
                  ) : (
                    <select name="asset_id" value={form.asset_id} onChange={handleChange} required
                      onFocus={() => setFocused("asset_id")} onBlur={() => setFocused(null)}
                      style={focusStyle("asset_id")}>
                      <option value="">— Pilih aset —</option>
                      {asetList.map((a) => (
                        <option key={a.id} value={a.id}>
                          {CATEGORY_LABEL[a.category] ?? a.category} {a.nama}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Staf */}
                <div>
                  <label style={labelStyle}>Ditugaskan kepada *</label>
                  {stafList.length === 0 ? (
                    <div style={{
                      padding: "0.875rem", background: "rgba(245,158,11,0.06)",
                      borderRadius: 10, fontSize: "0.8rem", color: "#854d0e",
                      border: "1px solid rgba(245,158,11,0.2)",
                    }}>
                      ⚠ Belum ada staf. Tambah di menu <strong>Tim Staf</strong> terlebih dahulu.
                    </div>
                  ) : (
                    <select name="assigned_to" value={form.assigned_to} onChange={handleChange} required
                      onFocus={() => setFocused("assigned_to")} onBlur={() => setFocused(null)}
                      style={focusStyle("assigned_to")}>
                      <option value="">— Pilih staf —</option>
                      {stafList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nama}{s.phone ? ` · ${s.phone}` : ""}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Jenis servis */}
                <div>
                  <label style={labelStyle}>Jenis Servis *</label>
                  <select name="service_type" value={form.service_type} onChange={handleChange} required
                    onFocus={() => setFocused("service_type")} onBlur={() => setFocused(null)}
                    style={focusStyle("service_type")}>
                    <option value="">— Pilih jenis servis —</option>
                    {JENIS_SERVIS.map((j) => (
                      <option key={j.value} value={j.value}>{j.label}</option>
                    ))}
                  </select>
                </div>

                {/* Judul */}
                <div>
                  <label style={labelStyle}>Judul Tugas *</label>
                  <input name="judul" type="text" value={form.judul} onChange={handleChange} required
                    placeholder="Contoh: Servis 10.000 km BMW Seri 5"
                    onFocus={() => setFocused("judul")} onBlur={() => setFocused(null)}
                    style={focusStyle("judul")} />
                </div>

                {/* Deskripsi */}
                <div>
                  <label style={labelStyle}>Instruksi / Deskripsi</label>
                  <textarea name="deskripsi" value={form.deskripsi}
                    onChange={(e) => { setForm({ ...form, deskripsi: e.target.value }); setError(""); }}
                    placeholder="Detail instruksi untuk staf (opsional)"
                    onFocus={() => setFocused("deskripsi")} onBlur={() => setFocused(null)}
                    style={{
                      ...focusStyle("deskripsi"),
                      minHeight: 80, resize: "vertical",
                    }} />
                </div>

                {/* Jatuh tempo */}
                <div>
                  <label style={labelStyle}>Jatuh Tempo</label>
                  <input name="due_date" type="date" value={form.due_date} onChange={handleChange}
                    onFocus={() => setFocused("due_date")} onBlur={() => setFocused(null)}
                    style={focusStyle("due_date")} />
                </div>

                {error && (
                  <div style={{
                    background: "rgba(254,242,242,0.9)", border: "1px solid #fecaca",
                    borderRadius: 10, padding: "0.7rem 0.875rem",
                    fontSize: "0.82rem", color: "#dc2626",
                    display: "flex", alignItems: "center", gap: "0.5rem",
                  }}>
                    ⚠ {error}
                  </div>
                )}

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
                  <button type="button" onClick={() => { setOpen(false); setError(""); setForm(EMPTY); }} style={{
                    flex: 1, padding: "0.7rem", background: "#f8fafc",
                    border: "1.5px solid #e2e8f0", borderRadius: 10,
                    fontSize: "0.875rem", cursor: "pointer", color: "#475569", fontWeight: 500,
                  }}>
                    Batal
                  </button>
                  <button type="submit" disabled={!canSubmit} style={{
                    flex: 2, padding: "0.7rem",
                    background: canSubmit
                      ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                      : "#cbd5e1",
                    color: "#fff", border: "none", borderRadius: 10,
                    fontSize: "0.875rem", fontWeight: 700,
                    cursor: canSubmit ? "pointer" : "not-allowed",
                    boxShadow: canSubmit ? "0 4px 12px rgba(99,102,241,0.3)" : "none",
                  }}>
                    {loading ? "Menyimpan..." : "Buat Tugas"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

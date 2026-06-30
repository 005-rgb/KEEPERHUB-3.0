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
  width: "100%", padding: "0.6rem 0.75rem",
  border: "1.5px solid #e2e8f0", borderRadius: 8,
  fontSize: "0.85rem", outline: "none", boxSizing: "border-box", background: "#fff",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.75rem", fontWeight: 600,
  color: "#374151", marginBottom: "0.3rem",
};

const EMPTY = { asset_id: "", assigned_to: "", service_type: "", judul: "", deskripsi: "", due_date: "" };

type Aset = { id: string; nama: string; category: string };
type Staf = { id: string; nama: string; phone: string | null; email: string | null };

export default function BuatTugasForm({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [asetList, setAsetList] = useState<Aset[]>([]);
  const [stafList, setStafList] = useState<Staf[]>([]);
  const [fetching, setFetching] = useState(false);

  // Fetch aset & staf saat modal dibuka
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

  return (
    <>
      <button onClick={() => setOpen(true)} style={{
        padding: "0.6rem 1.1rem", background: "#0f172a", color: "#fff",
        border: "none", borderRadius: 8, fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
      }}>
        + Buat Tugas
      </button>

      {open && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "1rem",
        }}>
          <div style={{
            background: "#fff", borderRadius: 16, padding: "2rem",
            width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontWeight: 700, fontSize: "1.1rem", color: "#0f172a" }}>Buat Tugas Baru</h2>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>

            {fetching ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Memuat data...</div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                {/* Aset */}
                <div>
                  <label style={labelStyle}>Aset yang Diservis *</label>
                  {asetList.length === 0 ? (
                    <div style={{ padding: "0.75rem", background: "#fef9c3", borderRadius: 8, fontSize: "0.8rem", color: "#854d0e" }}>
                      Belum ada aset. Tambah aset terlebih dahulu di menu <strong>Aset Saya</strong>.
                    </div>
                  ) : (
                    <select name="asset_id" value={form.asset_id} onChange={handleChange} required style={inputStyle}>
                      <option value="">— Pilih aset —</option>
                      {asetList.map((a) => (
                        <option key={a.id} value={a.id}>{a.nama} ({a.category})</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Staf */}
                <div>
                  <label style={labelStyle}>Ditugaskan ke *</label>
                  {stafList.length === 0 ? (
                    <div style={{ padding: "0.75rem", background: "#fef9c3", borderRadius: 8, fontSize: "0.8rem", color: "#854d0e" }}>
                      Belum ada akun staf terdaftar di sistem. Staf harus mendaftar terlebih dahulu dengan role <strong>staff</strong>.
                    </div>
                  ) : (
                    <select name="assigned_to" value={form.assigned_to} onChange={handleChange} required style={inputStyle}>
                      <option value="">— Pilih staf —</option>
                      {stafList.map((s) => (
                        <option key={s.id} value={s.id}>{s.nama} {s.phone ? `· ${s.phone}` : ""}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Jenis servis */}
                <div>
                  <label style={labelStyle}>Jenis Servis *</label>
                  <select name="service_type" value={form.service_type} onChange={handleChange} required style={inputStyle}>
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
                    placeholder="Contoh: Servis 10.000 km BMW Seri 5" style={inputStyle} />
                </div>

                {/* Deskripsi */}
                <div>
                  <label style={labelStyle}>Instruksi / Deskripsi</label>
                  <textarea name="deskripsi" value={form.deskripsi}
                    onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                    placeholder="Detail instruksi untuk staf (opsional)"
                    style={{ ...inputStyle, minHeight: 80, resize: "vertical", fontFamily: "inherit" }} />
                </div>

                {/* Jatuh tempo */}
                <div>
                  <label style={labelStyle}>Jatuh Tempo</label>
                  <input name="due_date" type="date" value={form.due_date} onChange={handleChange} style={inputStyle} />
                </div>

                {error && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "0.65rem", fontSize: "0.82rem", color: "#dc2626" }}>
                    {error}
                  </div>
                )}

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <button type="button" onClick={() => setOpen(false)} style={{
                    flex: 1, padding: "0.7rem", background: "#f1f5f9", border: "1px solid #e2e8f0",
                    borderRadius: 8, fontSize: "0.85rem", cursor: "pointer", color: "#475569",
                  }}>
                    Batal
                  </button>
                  <button type="submit" disabled={loading || asetList.length === 0 || stafList.length === 0} style={{
                    flex: 2, padding: "0.7rem",
                    background: (loading || asetList.length === 0 || stafList.length === 0) ? "#94a3b8" : "#0f172a",
                    color: "#fff", border: "none", borderRadius: 8,
                    fontSize: "0.85rem", fontWeight: 600,
                    cursor: (loading || asetList.length === 0 || stafList.length === 0) ? "not-allowed" : "pointer",
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

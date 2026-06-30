"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const KATEGORI = [
  { value: "PROPERTY", label: "🏠 Properti" },
  { value: "VEHICLE", label: "🚗 Kendaraan" },
  { value: "ELECTRONIC", label: "💻 Elektronik" },
  { value: "LUXURY_GOODS", label: "💎 Barang Mewah" },
];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.65rem 0.875rem",
  border: "1.5px solid #e2e8f0", borderRadius: 10,
  fontSize: "0.875rem", outline: "none", boxSizing: "border-box",
  background: "#fff", color: "#0f172a",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.75rem", fontWeight: 600,
  color: "#374151", marginBottom: "0.35rem", letterSpacing: "0.1px",
};

const EMPTY = {
  category: "", nama: "", deskripsi: "",
  purchase_price: "", purchase_date: "",
  current_value: "", taxation_deadline: "", warranty_end_date: "",
};

export default function TambahAsetForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  const focusStyle = (field: string): React.CSSProperties => ({
    ...inputStyle,
    borderColor: focused === field ? "#6366f1" : "#e2e8f0",
    boxShadow: focused === field ? "0 0 0 3px rgba(99,102,241,0.1)" : "none",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          purchase_price: Number(form.purchase_price.replace(/\./g, "").replace(",", ".")),
          current_value: form.current_value ? Number(form.current_value.replace(/\./g, "").replace(",", ".")) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.pesan || "Terjadi kesalahan.");
      } else {
        setOpen(false);
        setForm(EMPTY);
        router.refresh();
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
        padding: "0.65rem 1.25rem",
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        color: "#fff", border: "none", borderRadius: 12,
        fontSize: "0.875rem", fontWeight: 700, cursor: "pointer",
        boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
        display: "flex", alignItems: "center", gap: "0.4rem",
        letterSpacing: "0.2px",
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Tambah Aset
      </button>

      {open && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(15,23,42,0.6)",
          backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "1rem",
        }}>
          <div style={{
            background: "#fff", borderRadius: 20, padding: "2rem",
            width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 25px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(99,102,241,0.1)",
          }}>
            {/* Modal header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: "1.1rem", color: "#0f172a", letterSpacing: "-0.3px" }}>Tambah Aset Baru</h2>
                <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}>Isi data aset di bawah ini</p>
              </div>
              <button onClick={() => setOpen(false)} style={{
                background: "#f1f5f9", border: "none", width: 32, height: 32,
                borderRadius: 8, cursor: "pointer", color: "#64748b",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem",
              }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div>
                <label style={labelStyle}>Kategori Aset *</label>
                <select name="category" value={form.category} onChange={handleChange} required
                  onFocus={() => setFocused("category")} onBlur={() => setFocused(null)}
                  style={{ ...focusStyle("category"), background: "#fff" }}>
                  <option value="">— Pilih kategori —</option>
                  {KATEGORI.map((k) => (
                    <option key={k.value} value={k.value}>{k.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Nama Aset *</label>
                <input name="nama" type="text" placeholder="Contoh: BMW 5 Series 2023"
                  value={form.nama} onChange={handleChange} required
                  onFocus={() => setFocused("nama")} onBlur={() => setFocused(null)}
                  style={focusStyle("nama")} />
              </div>

              <div>
                <label style={labelStyle}>Deskripsi</label>
                <textarea name="deskripsi" placeholder="Opsional — detail singkat aset"
                  value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  onFocus={() => setFocused("deskripsi")} onBlur={() => setFocused(null)}
                  style={{ ...focusStyle("deskripsi"), minHeight: 72, resize: "vertical", fontFamily: "inherit" }} />
              </div>

              <div>
                <label style={labelStyle}>Harga Beli (Rp) *</label>
                <input name="purchase_price" type="number" min="1" placeholder="Contoh: 1500000000"
                  value={form.purchase_price} onChange={handleChange} required
                  onFocus={() => setFocused("purchase_price")} onBlur={() => setFocused(null)}
                  style={focusStyle("purchase_price")} />
                {form.purchase_price && (
                  <div style={{ fontSize: "0.72rem", color: "#6366f1", marginTop: 4, fontWeight: 500 }}>
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(form.purchase_price))}
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>Nilai Taksiran Saat Ini (Rp)</label>
                <input name="current_value" type="number" min="0" placeholder="Opsional"
                  value={form.current_value} onChange={handleChange}
                  onFocus={() => setFocused("current_value")} onBlur={() => setFocused(null)}
                  style={focusStyle("current_value")} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={labelStyle}>Tanggal Pembelian</label>
                  <input name="purchase_date" type="date" value={form.purchase_date} onChange={handleChange}
                    onFocus={() => setFocused("purchase_date")} onBlur={() => setFocused(null)}
                    style={focusStyle("purchase_date")} />
                </div>
                <div>
                  <label style={labelStyle}>Deadline Pajak</label>
                  <input name="taxation_deadline" type="date" value={form.taxation_deadline} onChange={handleChange}
                    onFocus={() => setFocused("taxation_deadline")} onBlur={() => setFocused(null)}
                    style={focusStyle("taxation_deadline")} />
                </div>
              </div>
              <p style={{ fontSize: "0.68rem", color: "#94a3b8", marginTop: -4 }}>Anda akan diingatkan H-14 sebelum pajak jatuh tempo.</p>

              <div>
                <label style={labelStyle}>Tanggal Berakhir Garansi</label>
                <input name="warranty_end_date" type="date" value={form.warranty_end_date} onChange={handleChange}
                  onFocus={() => setFocused("warranty_end_date")} onBlur={() => setFocused(null)}
                  style={focusStyle("warranty_end_date")} />
              </div>

              {error && (
                <div style={{
                  background: "rgba(254,242,242,0.9)", border: "1px solid #fecaca",
                  borderRadius: 10, padding: "0.65rem 0.875rem",
                  fontSize: "0.82rem", color: "#dc2626",
                  display: "flex", alignItems: "center", gap: "0.5rem",
                }}>
                  <span>⚠</span> {error}
                </div>
              )}

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button type="button" onClick={() => setOpen(false)} style={{
                  flex: 1, padding: "0.7rem",
                  background: "#f8fafc", border: "1.5px solid #e2e8f0",
                  borderRadius: 10, fontSize: "0.875rem", cursor: "pointer", color: "#475569", fontWeight: 500,
                }}>
                  Batal
                </button>
                <button type="submit" disabled={loading} style={{
                  flex: 2, padding: "0.7rem",
                  background: loading ? "#a5b4fc" : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  color: "#fff", border: "none", borderRadius: 10,
                  fontSize: "0.875rem", fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: loading ? "none" : "0 4px 12px rgba(99,102,241,0.3)",
                }}>
                  {loading ? "Menyimpan..." : "Simpan Aset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

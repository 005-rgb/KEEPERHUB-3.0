"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const KATEGORI = [
  { value: "PROPERTY", label: "Properti" },
  { value: "VEHICLE", label: "Kendaraan" },
  { value: "ELECTRONIC", label: "Elektronik" },
  { value: "LUXURY_GOODS", label: "Barang Mewah" },
];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.6rem 0.75rem",
  border: "1.5px solid #e2e8f0", borderRadius: 8,
  fontSize: "0.85rem", outline: "none", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.75rem", fontWeight: 600,
  color: "#374151", marginBottom: "0.3rem",
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

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
        padding: "0.6rem 1.1rem", background: "#0f172a", color: "#fff",
        border: "none", borderRadius: 8, fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
      }}>
        + Tambah Aset
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
              <h2 style={{ fontWeight: 700, fontSize: "1.1rem", color: "#0f172a" }}>Tambah Aset Baru</h2>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Kategori */}
              <div>
                <label style={labelStyle}>Kategori Aset *</label>
                <select name="category" value={form.category} onChange={handleChange} required style={{ ...inputStyle, background: "#fff" }}>
                  <option value="">— Pilih kategori —</option>
                  {KATEGORI.map((k) => (
                    <option key={k.value} value={k.value}>{k.label}</option>
                  ))}
                </select>
              </div>

              {/* Nama */}
              <div>
                <label style={labelStyle}>Nama Aset *</label>
                <input name="nama" type="text" placeholder="Contoh: BMW 5 Series 2023" value={form.nama} onChange={handleChange} required style={inputStyle} />
              </div>

              {/* Deskripsi */}
              <div>
                <label style={labelStyle}>Deskripsi</label>
                <textarea name="deskripsi" placeholder="Opsional — detail singkat aset" value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  style={{ ...inputStyle, minHeight: 72, resize: "vertical", fontFamily: "inherit" }} />
              </div>

              {/* Harga beli */}
              <div>
                <label style={labelStyle}>Harga Beli (Rp) *</label>
                <input name="purchase_price" type="number" min="1" placeholder="Contoh: 1500000000" value={form.purchase_price} onChange={handleChange} required style={inputStyle} />
                {form.purchase_price && (
                  <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 3 }}>
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(form.purchase_price))}
                  </div>
                )}
              </div>

              {/* Nilai saat ini */}
              <div>
                <label style={labelStyle}>Nilai Taksiran Saat Ini (Rp)</label>
                <input name="current_value" type="number" min="0" placeholder="Opsional" value={form.current_value} onChange={handleChange} style={inputStyle} />
              </div>

              {/* Tanggal beli */}
              <div>
                <label style={labelStyle}>Tanggal Pembelian</label>
                <input name="purchase_date" type="date" value={form.purchase_date} onChange={handleChange} style={inputStyle} />
              </div>

              {/* Deadline pajak */}
              <div>
                <label style={labelStyle}>Deadline Pajak</label>
                <input name="taxation_deadline" type="date" value={form.taxation_deadline} onChange={handleChange} style={inputStyle} />
                <p style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: 2 }}>Anda akan diingatkan H-14 sebelum jatuh tempo.</p>
              </div>

              {/* Garansi */}
              <div>
                <label style={labelStyle}>Tanggal Berakhir Garansi</label>
                <input name="warranty_end_date" type="date" value={form.warranty_end_date} onChange={handleChange} style={inputStyle} />
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
                <button type="submit" disabled={loading} style={{
                  flex: 2, padding: "0.7rem", background: loading ? "#94a3b8" : "#0f172a",
                  color: "#fff", border: "none", borderRadius: 8,
                  fontSize: "0.85rem", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
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

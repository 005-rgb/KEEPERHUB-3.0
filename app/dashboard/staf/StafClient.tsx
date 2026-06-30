"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Staf = {
  id: string;
  nama: string;
  email: string | null;
  phone: string | null;
  created_at: string;
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.65rem 0.875rem",
  border: "1.5px solid #e2e8f0", borderRadius: 10,
  fontSize: "0.875rem", outline: "none", boxSizing: "border-box",
  background: "#fff", color: "#0f172a",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.75rem", fontWeight: 600,
  color: "#374151", marginBottom: "0.35rem",
};

const EMPTY = { nama: "", email: "", phone: "", password: "" };

function getWhatsAppLink(phone: string | null, nama: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  const wa = digits.startsWith("62") ? digits : `62${digits.slice(1)}`;
  const msg = encodeURIComponent(
    `Halo ${nama}, Anda telah ditambahkan sebagai staf di KeeperHub. Silakan login menggunakan nomor HP Anda.`
  );
  return `https://wa.me/${wa}?text=${msg}`;
}

export default function StafClient({ daftarStaf }: { daftarStaf: Staf[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);

  const focusStyle = (field: string): React.CSSProperties => ({
    ...inputStyle,
    borderColor: focused === field ? "#6366f1" : "#e2e8f0",
    boxShadow: focused === field ? "0 0 0 3px rgba(99,102,241,0.1)" : "none",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/staf", {
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
        router.refresh();
      }
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, nama: string) {
    if (!confirm(`Hapus staf "${nama}"? Staf tidak bisa dihapus jika masih memiliki tugas aktif.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/staf?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.pesan || "Gagal menghapus staf.");
      } else {
        router.refresh();
      }
    } catch {
      alert("Gagal terhubung ke server.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginBottom: 6, letterSpacing: "-0.4px" }}>
            Tim Staf
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
            {daftarStaf.length} staf terdaftar
          </p>
        </div>
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
          Tambah Staf
        </button>
      </div>

      {/* Info banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.05) 100%)",
        border: "1px solid rgba(99,102,241,0.15)",
        borderRadius: 14, padding: "1rem 1.25rem",
        display: "flex", alignItems: "flex-start", gap: "0.75rem",
        marginBottom: "1.75rem",
      }}>
        <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>💡</span>
        <div style={{ fontSize: "0.8rem", color: "#4f46e5", lineHeight: 1.6 }}>
          <strong>Cara kerja Magic Link:</strong> Setelah menambah staf, kirim link WhatsApp ke mereka.
          Staf dapat mengakses tugas langsung tanpa login menggunakan Magic Link yang Anda kirim dari halaman Penugasan.
        </div>
      </div>

      {/* Empty state */}
      {daftarStaf.length === 0 ? (
        <div style={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(12px)",
          borderRadius: 20,
          border: "2px dashed rgba(99,102,241,0.2)",
          padding: "4rem 2rem", textAlign: "center",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👥</div>
          <p style={{ color: "#475569", fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            Belum ada staf terdaftar
          </p>
          <p style={{ color: "#94a3b8", fontSize: "0.82rem" }}>
            Klik <strong style={{ color: "#6366f1" }}>+ Tambah Staf</strong> untuk mendaftarkan staf pertama Anda.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {daftarStaf.map((staf) => {
            const waLink = getWhatsAppLink(staf.phone, staf.nama);
            const inisial = staf.nama.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
            return (
              <div key={staf.id} style={{
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(12px)",
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,0.8)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(99,102,241,0.07)",
                overflow: "hidden",
              }}>
                {/* Accent bar */}
                <div style={{ height: 3, background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }} />

                <div style={{ padding: "1.25rem" }}>
                  {/* Avatar + nama */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "1rem" }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                      background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.85rem", fontWeight: 700, color: "#fff",
                      boxShadow: "0 4px 10px rgba(99,102,241,0.25)",
                    }}>
                      {inisial}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>{staf.nama}</div>
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: "0.3rem",
                        fontSize: "0.65rem", fontWeight: 600, marginTop: 3,
                        color: "#6366f1", background: "rgba(99,102,241,0.08)",
                        padding: "0.15rem 0.5rem", borderRadius: 99,
                        border: "1px solid rgba(99,102,241,0.15)",
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#6366f1", display: "inline-block" }} />
                        Staf Aktif
                      </div>
                    </div>
                  </div>

                  {/* Kontak */}
                  <div style={{
                    display: "flex", flexDirection: "column", gap: "0.5rem",
                    padding: "0.875rem",
                    background: "rgba(99,102,241,0.025)",
                    borderRadius: 12,
                    border: "1px solid rgba(99,102,241,0.06)",
                    marginBottom: "0.875rem",
                  }}>
                    {staf.phone && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem" }}>
                        <span style={{ color: "#6366f1", display: "flex" }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.11 7.82a16 16 0 006.07 6.07l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/>
                          </svg>
                        </span>
                        <span style={{ color: "#475569" }}>{staf.phone}</span>
                      </div>
                    )}
                    {staf.email && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem" }}>
                        <span style={{ color: "#6366f1", display: "flex" }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                          </svg>
                        </span>
                        <span style={{ color: "#475569" }}>{staf.email}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem" }}>
                      <span style={{ color: "#94a3b8", display: "flex" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                      </span>
                      <span style={{ color: "#94a3b8" }}>Bergabung {staf.created_at}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {waLink ? (
                      <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
                        flex: 1, padding: "0.55rem 0.75rem",
                        background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                        color: "#fff", borderRadius: 10, fontSize: "0.78rem",
                        fontWeight: 700, textDecoration: "none",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem",
                        boxShadow: "0 3px 8px rgba(34,197,94,0.25)",
                      }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                          <path d="M11.5 2C6.262 2 2 6.262 2 11.5c0 1.682.444 3.259 1.22 4.625L2 22l6.125-1.205A9.46 9.46 0 0011.5 21C16.738 21 21 16.738 21 11.5S16.738 2 11.5 2zm0 17.25a7.74 7.74 0 01-4.07-1.155l-.291-.173-3.637.715.732-3.548-.19-.302A7.716 7.716 0 013.75 11.5c0-4.273 3.477-7.75 7.75-7.75s7.75 3.477 7.75 7.75-3.477 7.75-7.75 7.75z"/>
                        </svg>
                        WhatsApp
                      </a>
                    ) : (
                      <div style={{
                        flex: 1, padding: "0.55rem 0.75rem",
                        background: "#f1f5f9", color: "#94a3b8",
                        borderRadius: 10, fontSize: "0.78rem",
                        fontWeight: 500, textAlign: "center",
                      }}>
                        Tidak ada HP
                      </div>
                    )}
                    <button
                      onClick={() => handleDelete(staf.id, staf.nama)}
                      disabled={deleting === staf.id}
                      style={{
                        padding: "0.55rem 0.75rem",
                        background: "rgba(239,68,68,0.06)",
                        color: "#dc2626", border: "1px solid rgba(239,68,68,0.15)",
                        borderRadius: 10, fontSize: "0.78rem", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: "0.3rem",
                        fontWeight: 600,
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                      </svg>
                      {deleting === staf.id ? "..." : "Hapus"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal tambah staf */}
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
            width: "100%", maxWidth: 460,
            boxShadow: "0 25px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(99,102,241,0.1)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: "1.1rem", color: "#0f172a", letterSpacing: "-0.3px" }}>Tambah Staf Baru</h2>
                <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}>Daftarkan akun staf untuk tim Anda</p>
              </div>
              <button onClick={() => { setOpen(false); setError(""); setForm(EMPTY); }} style={{
                background: "#f1f5f9", border: "none", width: 32, height: 32,
                borderRadius: 8, cursor: "pointer", color: "#64748b",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem",
              }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div>
                <label style={labelStyle}>Nama Lengkap *</label>
                <input name="nama" type="text" placeholder="Nama staf"
                  value={form.nama} onChange={handleChange} required
                  onFocus={() => setFocused("nama")} onBlur={() => setFocused(null)}
                  style={focusStyle("nama")} />
              </div>

              <div>
                <label style={labelStyle}>Nomor HP (WhatsApp)</label>
                <input name="phone" type="tel" placeholder="08xx-xxxx-xxxx"
                  value={form.phone} onChange={handleChange}
                  onFocus={() => setFocused("phone")} onBlur={() => setFocused(null)}
                  style={focusStyle("phone")} />
                <p style={{ fontSize: "0.68rem", color: "#94a3b8", marginTop: 4 }}>
                  Diperlukan untuk mengirim Magic Link via WhatsApp
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, #e2e8f0)" }} />
                <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 500 }}>atau</span>
                <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, #e2e8f0)" }} />
              </div>

              <div>
                <label style={labelStyle}>Email</label>
                <input name="email" type="email" placeholder="staf@email.com"
                  value={form.email} onChange={handleChange}
                  onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                  style={focusStyle("email")} />
              </div>

              <div>
                <label style={labelStyle}>Kata Sandi *</label>
                <input name="password" type="password" placeholder="Minimal 8 karakter"
                  value={form.password} onChange={handleChange} required
                  onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
                  style={focusStyle("password")} />
                <p style={{ fontSize: "0.68rem", color: "#94a3b8", marginTop: 4 }}>
                  Bagikan kata sandi ini ke staf agar mereka bisa login pertama kali
                </p>
              </div>

              {error && (
                <div style={{
                  background: "rgba(254,242,242,0.9)", border: "1px solid #fecaca",
                  borderRadius: 10, padding: "0.7rem 0.875rem",
                  fontSize: "0.82rem", color: "#dc2626",
                  display: "flex", alignItems: "center", gap: "0.5rem",
                }}>
                  <span>⚠</span> {error}
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
                <button type="submit" disabled={loading} style={{
                  flex: 2, padding: "0.7rem",
                  background: loading ? "#a5b4fc" : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  color: "#fff", border: "none", borderRadius: 10,
                  fontSize: "0.875rem", fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: loading ? "none" : "0 4px 12px rgba(99,102,241,0.3)",
                }}>
                  {loading ? "Menyimpan..." : "Tambah Staf"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";

type Props = {
  taskId: string;
  taskJudul: string;
  stafNama: string | null;
  stafPhone: string | null;
  existingToken: string | null;
};

function buildWaLink(phone: string, nama: string, url: string, judul: string): string {
  const digits = phone.replace(/\D/g, "");
  const wa = digits.startsWith("62") ? digits : `62${digits.slice(1)}`;
  const msg = encodeURIComponent(
    `Halo ${nama}, Anda mendapatkan tugas baru di KeeperHub:\n\n📋 *${judul}*\n\nKlik link berikut untuk melihat detail dan mengerjakan tugas:\n${url}\n\n_Link berlaku 30 hari._`
  );
  return `https://wa.me/${wa}?text=${msg}`;
}

function getAppUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}

export default function MagicLinkPanel({ taskId, taskJudul, stafNama, stafPhone, existingToken }: Props) {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(existingToken);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const magicUrl = token ? `${getAppUrl()}/magic?token=${token}` : null;

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: taskId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.pesan || "Gagal membuat magic link.");
      } else {
        setToken(data.token);
      }
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!magicUrl) return;
    try {
      await navigator.clipboard.writeText(magicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Tidak bisa menyalin — copy manual dari kotak teks.");
    }
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        title="Magic Link untuk staf"
        style={{
          padding: "0.3rem 0.6rem",
          background: token ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.05)",
          border: `1px solid ${token ? "rgba(99,102,241,0.25)" : "rgba(99,102,241,0.15)"}`,
          borderRadius: 8, cursor: "pointer",
          color: "#6366f1", fontSize: "0.7rem", fontWeight: 700,
          display: "flex", alignItems: "center", gap: "0.3rem",
          whiteSpace: "nowrap",
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
        </svg>
        {token ? "Magic Link ✓" : "Magic Link"}
      </button>

      {/* Panel modal */}
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(15,23,42,0.65)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 2000, padding: "1rem",
          }}
        >
          <div style={{
            background: "#fff", borderRadius: 20, padding: "2rem",
            width: "100%", maxWidth: 460,
            boxShadow: "0 25px 80px rgba(0,0,0,0.25)",
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: 4 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                    </svg>
                  </div>
                  <h2 style={{ fontWeight: 800, fontSize: "1rem", color: "#0f172a" }}>Magic Link Staf</h2>
                </div>
                <p style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                  Kirim link ini ke <strong style={{ color: "#475569" }}>{stafNama ?? "staf"}</strong> lewat WhatsApp
                </p>
              </div>
              <button onClick={() => { setOpen(false); setError(""); }} style={{
                background: "#f1f5f9", border: "none", width: 30, height: 30,
                borderRadius: 8, cursor: "pointer", color: "#64748b",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>✕</button>
            </div>

            {/* Info tugas */}
            <div style={{
              background: "rgba(99,102,241,0.04)",
              border: "1px solid rgba(99,102,241,0.12)",
              borderRadius: 12, padding: "0.75rem 0.875rem",
              marginBottom: "1.25rem",
              fontSize: "0.8rem", color: "#475569",
            }}>
              <span style={{ color: "#94a3b8" }}>Tugas: </span>
              <strong style={{ color: "#0f172a" }}>{taskJudul}</strong>
            </div>

            {/* Belum ada token */}
            {!token ? (
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: "rgba(99,102,241,0.06)",
                  border: "2px dashed rgba(99,102,241,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 1rem",
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                  </svg>
                </div>
                <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
                  Belum ada magic link untuk tugas ini.<br />
                  Generate link agar staf bisa masuk tanpa kata sandi.
                </p>
                <button onClick={generate} disabled={loading} style={{
                  padding: "0.75rem 1.75rem",
                  background: loading ? "#a5b4fc" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "#fff", border: "none", borderRadius: 12,
                  fontWeight: 700, fontSize: "0.875rem", cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
                }}>
                  {loading ? "Membuat..." : "⚡ Generate Magic Link"}
                </button>
              </div>
            ) : (
              <>
                {/* Link URL */}
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#374151", marginBottom: "0.4rem" }}>
                    Link Akses Staf
                  </label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      readOnly
                      value={magicUrl ?? ""}
                      style={{
                        flex: 1, padding: "0.6rem 0.75rem",
                        border: "1.5px solid #e2e8f0", borderRadius: 10,
                        fontSize: "0.72rem", color: "#475569", background: "#f8fafc",
                        outline: "none", overflow: "hidden", textOverflow: "ellipsis",
                        fontFamily: "monospace",
                      }}
                    />
                    <button onClick={copyLink} style={{
                      padding: "0.6rem 0.875rem",
                      background: copied ? "rgba(16,185,129,0.1)" : "rgba(99,102,241,0.08)",
                      border: `1.5px solid ${copied ? "rgba(16,185,129,0.3)" : "rgba(99,102,241,0.2)"}`,
                      borderRadius: 10, cursor: "pointer",
                      color: copied ? "#059669" : "#6366f1",
                      fontSize: "0.72rem", fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}>
                      {copied ? "✓ Disalin!" : "Salin"}
                    </button>
                  </div>
                </div>

                {/* Info masa berlaku */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  fontSize: "0.72rem", color: "#64748b",
                  background: "rgba(16,185,129,0.05)",
                  border: "1px solid rgba(16,185,129,0.15)",
                  borderRadius: 8, padding: "0.5rem 0.75rem",
                  marginBottom: "1.25rem",
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <span>Link aktif · berlaku 30 hari · staf masuk langsung tanpa kata sandi</span>
                </div>

                {/* Tombol aksi */}
                <div style={{ display: "flex", gap: "0.625rem" }}>
                  {stafPhone && magicUrl ? (
                    <a
                      href={buildWaLink(stafPhone, stafNama ?? "Staf", magicUrl, taskJudul)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1, padding: "0.7rem 1rem",
                        background: "linear-gradient(135deg, #22c55e, #16a34a)",
                        color: "#fff", borderRadius: 12, textDecoration: "none",
                        fontWeight: 700, fontSize: "0.85rem",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
                        boxShadow: "0 4px 12px rgba(34,197,94,0.3)",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                        <path d="M11.5 2C6.262 2 2 6.262 2 11.5c0 1.682.444 3.259 1.22 4.625L2 22l6.125-1.205A9.46 9.46 0 0011.5 21C16.738 21 21 16.738 21 11.5S16.738 2 11.5 2zm0 17.25a7.74 7.74 0 01-4.07-1.155l-.291-.173-3.637.715.732-3.548-.19-.302A7.716 7.716 0 013.75 11.5c0-4.273 3.477-7.75 7.75-7.75s7.75 3.477 7.75 7.75-3.477 7.75-7.75 7.75z"/>
                      </svg>
                      Kirim via WhatsApp
                    </a>
                  ) : (
                    <div style={{
                      flex: 1, padding: "0.7rem",
                      background: "#f1f5f9", borderRadius: 12,
                      color: "#94a3b8", fontSize: "0.8rem", textAlign: "center",
                    }}>
                      Staf tidak punya nomor HP
                    </div>
                  )}
                  <button onClick={generate} disabled={loading} title="Generate ulang link (link lama tidak berlaku)" style={{
                    padding: "0.7rem 0.875rem",
                    background: "rgba(99,102,241,0.06)",
                    border: "1.5px solid rgba(99,102,241,0.15)",
                    borderRadius: 12, cursor: loading ? "not-allowed" : "pointer",
                    color: "#6366f1", fontSize: "0.78rem", fontWeight: 700,
                    display: "flex", alignItems: "center", gap: "0.35rem",
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
                    </svg>
                    {loading ? "..." : "Perbarui"}
                  </button>
                </div>
              </>
            )}

            {error && (
              <div style={{
                marginTop: "1rem", background: "rgba(254,242,242,0.9)",
                border: "1px solid #fecaca", borderRadius: 10,
                padding: "0.65rem 0.875rem", fontSize: "0.8rem", color: "#dc2626",
              }}>
                ⚠ {error}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

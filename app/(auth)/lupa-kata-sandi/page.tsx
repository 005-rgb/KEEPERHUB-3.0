"use client";
import { useState } from "react";
import Link from "next/link";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  border: "1.5px solid #e2e8f0",
  borderRadius: 12,
  fontSize: "0.9rem",
  outline: "none",
  boxSizing: "border-box",
  background: "rgba(255,255,255,0.9)",
  color: "#0f172a",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.78rem",
  fontWeight: 600,
  color: "#374151",
  marginBottom: "0.4rem",
  letterSpacing: "0.2px",
};

export default function LupaKataSandiPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.pesan || "Terjadi kesalahan.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "rgba(16,185,129,0.1)",
            border: "2px solid rgba(16,185,129,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1rem",
            fontSize: "1.5rem",
          }}>
            ✉️
          </div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.5rem" }}>
            Email Terkirim!
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.6, margin: 0 }}>
            Jika <strong style={{ color: "#0f172a" }}>{email}</strong> terdaftar di KeeperHub,
            Anda akan menerima link reset kata sandi dalam beberapa menit.
          </p>
        </div>

        <div style={{
          background: "rgba(99,102,241,0.05)",
          border: "1px solid rgba(99,102,241,0.12)",
          borderRadius: 12, padding: "1rem",
          fontSize: "0.8rem", color: "#64748b", lineHeight: 1.6,
        }}>
          <strong style={{ color: "#0f172a", display: "block", marginBottom: 4 }}>Tidak menerima email?</strong>
          Periksa folder spam atau{" "}
          <button
            onClick={() => { setSuccess(false); setEmail(""); }}
            style={{ background: "none", border: "none", color: "#6366f1", fontWeight: 600, cursor: "pointer", padding: 0, fontSize: "inherit" }}
          >
            coba lagi
          </button>
          .
        </div>

        <p style={{ textAlign: "center", fontSize: "0.82rem", color: "#64748b", marginTop: "1.5rem" }}>
          <Link href="/login" style={{ color: "#6366f1", fontWeight: 700 }}>
            ← Kembali ke halaman masuk
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem", textAlign: "center" }}>
        Lupa Kata Sandi?
      </h2>
      <p style={{ textAlign: "center", fontSize: "0.82rem", color: "#64748b", marginBottom: "1.5rem", lineHeight: 1.5 }}>
        Masukkan email Anda. Kami akan kirim link untuk membuat kata sandi baru.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={labelStyle}>Alamat Email</label>
          <input
            type="email"
            placeholder="contoh@email.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            required
            style={{
              ...inputStyle,
              borderColor: focused ? "#6366f1" : "#e2e8f0",
              boxShadow: focused ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
            }}
          />
        </div>

        {error && (
          <div style={{
            background: "rgba(254,242,242,0.9)", border: "1px solid #fecaca",
            borderRadius: 10, padding: "0.7rem 0.9rem",
            fontSize: "0.82rem", color: "#dc2626",
            display: "flex", alignItems: "center", gap: "0.5rem",
          }}>
            <span>⚠</span> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%", padding: "0.8rem",
            background: loading ? "#a5b4fc" : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            color: "#fff", border: "none", borderRadius: 12,
            fontSize: "0.9rem", fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 4px 15px rgba(99,102,241,0.35)",
            transition: "opacity 0.2s",
          }}
        >
          {loading ? "Mengirim..." : "Kirim Link Reset"}
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: "0.82rem", color: "#64748b", marginTop: "1.5rem" }}>
        <Link href="/login" style={{ color: "#6366f1", fontWeight: 700 }}>
          ← Kembali ke halaman masuk
        </Link>
      </p>
    </>
  );
}

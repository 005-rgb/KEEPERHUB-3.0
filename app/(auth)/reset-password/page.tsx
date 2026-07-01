"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenError, setTokenError] = useState("");
  const [form, setForm] = useState({ password: "", konfirmasi: "" });
  const [focused, setFocused] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setTokenError("Token tidak ditemukan di URL.");
      return;
    }
    fetch(`/api/auth/reset-password?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        setTokenValid(data.valid);
        if (!data.valid) setTokenError(data.pesan || "Link tidak valid.");
      })
      .catch(() => {
        setTokenValid(false);
        setTokenError("Gagal memverifikasi link.");
      });
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.konfirmasi) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.pesan || "Terjadi kesalahan.");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      }
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  if (tokenValid === null) {
    return (
      <div style={{ textAlign: "center", padding: "2rem 0", color: "#64748b" }}>
        <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>⏳</div>
        Memverifikasi link...
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>⛔</div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.5rem" }}>
            Link Tidak Valid
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>{tokenError}</p>
        </div>
        <Link
          href="/lupa-kata-sandi"
          style={{
            display: "block", textAlign: "center", padding: "0.8rem",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff", borderRadius: 12, fontWeight: 700,
            fontSize: "0.9rem", textDecoration: "none",
            boxShadow: "0 4px 15px rgba(99,102,241,0.35)",
          }}
        >
          Minta Link Baru
        </Link>
        <p style={{ textAlign: "center", fontSize: "0.82rem", color: "#64748b", marginTop: "1rem" }}>
          <Link href="/login" style={{ color: "#6366f1", fontWeight: 700 }}>← Kembali ke masuk</Link>
        </p>
      </>
    );
  }

  if (success) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "rgba(16,185,129,0.1)",
          border: "2px solid rgba(16,185,129,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 1rem", fontSize: "1.5rem",
        }}>
          ✅
        </div>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.5rem" }}>
          Kata Sandi Diperbarui!
        </h2>
        <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.6, margin: "0 0 1.5rem" }}>
          Kata sandi Anda berhasil diubah. Anda akan diarahkan ke halaman masuk dalam 3 detik...
        </p>
        <Link
          href="/login"
          style={{
            display: "inline-block", padding: "0.75rem 2rem",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff", borderRadius: 12, fontWeight: 700,
            fontSize: "0.9rem", textDecoration: "none",
          }}
        >
          Masuk Sekarang
        </Link>
      </div>
    );
  }

  return (
    <>
      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem", textAlign: "center" }}>
        Buat Kata Sandi Baru
      </h2>
      <p style={{ textAlign: "center", fontSize: "0.82rem", color: "#64748b", marginBottom: "1.5rem" }}>
        Pastikan kata sandi baru minimal 8 karakter.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={labelStyle}>Kata Sandi Baru</label>
          <input
            type="password"
            placeholder="Minimal 8 karakter"
            value={form.password}
            onChange={(e) => { setForm({ ...form, password: e.target.value }); setError(""); }}
            onFocus={() => setFocused("password")}
            onBlur={() => setFocused(null)}
            required
            style={{
              ...inputStyle,
              borderColor: focused === "password" ? "#6366f1" : "#e2e8f0",
              boxShadow: focused === "password" ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
            }}
          />
        </div>

        <div>
          <label style={labelStyle}>Konfirmasi Kata Sandi</label>
          <input
            type="password"
            placeholder="Ulangi kata sandi baru"
            value={form.konfirmasi}
            onChange={(e) => { setForm({ ...form, konfirmasi: e.target.value }); setError(""); }}
            onFocus={() => setFocused("konfirmasi")}
            onBlur={() => setFocused(null)}
            required
            style={{
              ...inputStyle,
              borderColor: focused === "konfirmasi" ? "#6366f1" : "#e2e8f0",
              boxShadow: focused === "konfirmasi" ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
            }}
          />
          {form.konfirmasi && form.password !== form.konfirmasi && (
            <p style={{ margin: "0.3rem 0 0", fontSize: "0.75rem", color: "#dc2626" }}>
              Kata sandi tidak cocok
            </p>
          )}
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
          disabled={loading || form.password !== form.konfirmasi || form.password.length < 8}
          style={{
            width: "100%", padding: "0.8rem",
            background: (loading || form.password !== form.konfirmasi || form.password.length < 8)
              ? "#a5b4fc"
              : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            color: "#fff", border: "none", borderRadius: 12,
            fontSize: "0.9rem", fontWeight: 700,
            cursor: (loading || form.password !== form.konfirmasi || form.password.length < 8)
              ? "not-allowed" : "pointer",
            boxShadow: "0 4px 15px rgba(99,102,241,0.25)",
            transition: "opacity 0.2s",
          }}
        >
          {loading ? "Menyimpan..." : "Simpan Kata Sandi Baru"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ textAlign: "center", padding: "2rem 0", color: "#64748b" }}>
        <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>⏳</div>
        Memuat...
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

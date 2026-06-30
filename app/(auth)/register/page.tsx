"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nama: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  const focusStyle = (field: string): React.CSSProperties => ({
    ...inputStyle,
    borderColor: focused === field ? "#6366f1" : "#e2e8f0",
    boxShadow: focused === field ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email && !form.phone) {
      setError("Email atau nomor HP wajib diisi.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: form.nama,
          email: form.email || undefined,
          phone: form.phone || undefined,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.pesan || "Terjadi kesalahan.");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a", marginBottom: "1.5rem", textAlign: "center" }}>
        Buat Akun Baru
      </h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
        <div>
          <label style={labelStyle}>Nama Lengkap</label>
          <input name="nama" type="text" placeholder="Masukkan nama lengkap"
            value={form.nama} onChange={handleChange} required
            onFocus={() => setFocused("nama")} onBlur={() => setFocused(null)}
            style={focusStyle("nama")} />
        </div>

        <div>
          <label style={labelStyle}>Email</label>
          <input name="email" type="email" placeholder="contoh@email.com"
            value={form.email} onChange={handleChange}
            onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
            style={focusStyle("email")} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, #e2e8f0)" }} />
          <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 500 }}>atau</span>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, transparent, #e2e8f0)" }} />
        </div>

        <div>
          <label style={labelStyle}>Nomor HP</label>
          <input name="phone" type="tel" placeholder="08xx-xxxx-xxxx"
            value={form.phone} onChange={handleChange}
            onFocus={() => setFocused("phone")} onBlur={() => setFocused(null)}
            style={focusStyle("phone")} />
          <p style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: 4 }}>
            Format: 08xx atau +628xx (untuk notifikasi WhatsApp)
          </p>
        </div>

        <div>
          <label style={labelStyle}>Kata Sandi</label>
          <input name="password" type="password" placeholder="Minimal 8 karakter"
            value={form.password} onChange={handleChange} required
            onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
            style={focusStyle("password")} />
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
            marginTop: "0.25rem",
            boxShadow: loading ? "none" : "0 4px 15px rgba(99,102,241,0.35)",
            letterSpacing: "0.2px",
          }}
        >
          {loading ? "Memproses..." : "Daftar Sekarang"}
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: "0.82rem", color: "#64748b", marginTop: "1.5rem" }}>
        Sudah punya akun?{" "}
        <Link href="/login" style={{ color: "#6366f1", fontWeight: 700 }}>
          Masuk
        </Link>
      </p>
    </>
  );
}

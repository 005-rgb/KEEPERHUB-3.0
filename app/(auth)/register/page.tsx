"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.65rem 0.875rem",
  border: "1.5px solid #e2e8f0",
  borderRadius: "8px",
  fontSize: "0.9rem",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "#374151",
  marginBottom: "0.35rem",
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nama: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

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
      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", marginBottom: "1.5rem", textAlign: "center" }}>
        Buat Akun Baru
      </h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* Nama */}
        <div>
          <label style={labelStyle}>Nama Lengkap</label>
          <input
            name="nama"
            type="text"
            placeholder="Masukkan nama lengkap"
            value={form.nama}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        {/* Email */}
        <div>
          <label style={labelStyle}>Email</label>
          <input
            name="email"
            type="email"
            placeholder="contoh@email.com"
            value={form.email}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>atau</span>
          <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
        </div>

        {/* Nomor HP */}
        <div>
          <label style={labelStyle}>Nomor HP</label>
          <input
            name="phone"
            type="tel"
            placeholder="08xx-xxxx-xxxx"
            value={form.phone}
            onChange={handleChange}
            style={inputStyle}
          />
          <p style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "0.3rem" }}>
            Format: 08xx atau +628xx (untuk notifikasi WhatsApp)
          </p>
        </div>

        {/* Kata sandi */}
        <div>
          <label style={labelStyle}>Kata Sandi</label>
          <input
            name="password"
            type="password"
            placeholder="Minimal 8 karakter"
            value={form.password}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: "8px", padding: "0.65rem 0.875rem",
            fontSize: "0.82rem", color: "#dc2626",
          }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.75rem",
            background: loading ? "#94a3b8" : "#0f172a",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            marginTop: "0.25rem",
          }}
        >
          {loading ? "Memproses..." : "Daftar Sekarang"}
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: "0.82rem", color: "#64748b", marginTop: "1.5rem" }}>
        Sudah punya akun?{" "}
        <Link href="/login" style={{ color: "#0f172a", fontWeight: 600, textDecoration: "none" }}>
          Masuk
        </Link>
      </p>
    </>
  );
}

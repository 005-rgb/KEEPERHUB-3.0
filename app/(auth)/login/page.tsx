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
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "#374151",
  marginBottom: "0.35rem",
};

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
        Masuk ke Akun Anda
      </h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* Identifier */}
        <div>
          <label style={labelStyle}>Email atau Nomor HP</label>
          <input
            name="identifier"
            type="text"
            placeholder="contoh@email.com atau 08xx-xxxx-xxxx"
            value={form.identifier}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        {/* Kata sandi */}
        <div>
          <label style={labelStyle}>Kata Sandi</label>
          <input
            name="password"
            type="password"
            placeholder="Kata sandi Anda"
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
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: "0.82rem", color: "#64748b", marginTop: "1.5rem" }}>
        Belum punya akun?{" "}
        <Link href="/register" style={{ color: "#0f172a", fontWeight: 600, textDecoration: "none" }}>
          Daftar sekarang
        </Link>
      </p>
    </>
  );
}

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

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

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
      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a", marginBottom: "1.5rem", textAlign: "center" }}>
        Masuk ke Akun Anda
      </h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={labelStyle}>Email atau Nomor HP</label>
          <input
            name="identifier"
            type="text"
            placeholder="contoh@email.com atau 08xx-xxxx-xxxx"
            value={form.identifier}
            onChange={handleChange}
            onFocus={() => setFocused("identifier")}
            onBlur={() => setFocused(null)}
            required
            style={{
              ...inputStyle,
              borderColor: focused === "identifier" ? "#6366f1" : "#e2e8f0",
              boxShadow: focused === "identifier" ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
            }}
          />
        </div>

        <div>
          <label style={labelStyle}>Kata Sandi</label>
          <input
            name="password"
            type="password"
            placeholder="Kata sandi Anda"
            value={form.password}
            onChange={handleChange}
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
            width: "100%",
            padding: "0.8rem",
            background: loading
              ? "#a5b4fc"
              : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontSize: "0.9rem",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            marginTop: "0.25rem",
            boxShadow: loading ? "none" : "0 4px 15px rgba(99,102,241,0.35)",
            letterSpacing: "0.2px",
            transition: "opacity 0.2s, transform 0.1s",
          }}
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: "0.82rem", color: "#64748b", marginTop: "1rem" }}>
        <Link href="/lupa-kata-sandi" style={{ color: "#6366f1", fontWeight: 600 }}>
          Lupa kata sandi?
        </Link>
      </p>

      <p style={{ textAlign: "center", fontSize: "0.82rem", color: "#64748b", marginTop: "0.5rem" }}>
        Belum punya akun?{" "}
        <Link href="/register" style={{ color: "#6366f1", fontWeight: 700 }}>
          Daftar sekarang
        </Link>
      </p>
    </>
  );
}

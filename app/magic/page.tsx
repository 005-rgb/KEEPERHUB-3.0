import { db } from "@/server/db";
import { tasks, users, assets } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

const SERVICE_LABEL: Record<string, string> = {
  ROUTINE_SCHEDULED: "Servis Rutin Terjadwal",
  REPAIR_BREAKDOWN: "Perbaikan Kerusakan",
  CLEANING_DETAILING: "Cuci & Detailing",
  UPGRADE_MODIFICATION: "Upgrade / Modifikasi",
  INSPECTION_CERTIFICATION: "Inspeksi & Sertifikasi",
};

const ERROR_MSG: Record<string, string> = {
  token_hilang: "Link magic tidak valid — token tidak ditemukan.",
  token_tidak_valid: "Link magic tidak dikenali. Mungkin sudah diganti oleh pemilik.",
  token_kadaluarsa: "Link magic sudah kadaluarsa (berlaku 30 hari). Minta link baru dari pemilik aset.",
  staf_tidak_ditemukan: "Akun staf tidak ditemukan. Hubungi pemilik aset.",
};

export default async function MagicPage({
  searchParams,
}: {
  searchParams: { token?: string; error?: string };
}) {
  const { token, error } = searchParams;

  // Tampilkan pesan error
  if (error) {
    return (
      <div style={{
        minHeight: "100vh", background: "linear-gradient(135deg, #fef2f2 0%, #fff 50%, #fef2f2 100%)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
      }}>
        <div style={{
          background: "#fff", borderRadius: 24, padding: "2.5rem 2rem",
          maxWidth: 400, width: "100%", textAlign: "center",
          boxShadow: "0 20px 60px rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.15)",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
          <h1 style={{ fontWeight: 800, fontSize: "1.1rem", color: "#0f172a", marginBottom: "0.75rem" }}>
            Link Tidak Valid
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.6 }}>
            {ERROR_MSG[error] ?? "Terjadi kesalahan. Minta link baru dari pemilik aset."}
          </p>
          <div style={{
            marginTop: "1.5rem", padding: "0.875rem",
            background: "rgba(239,68,68,0.05)", borderRadius: 12,
            fontSize: "0.8rem", color: "#dc2626",
          }}>
            Hubungi pemilik aset via WhatsApp dan minta link akses baru.
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#f8fafc",
      }}>
        <p style={{ color: "#94a3b8" }}>Token tidak ditemukan.</p>
      </div>
    );
  }

  // Ambil data task berdasarkan token
  const result = await db
    .select({
      task_id: tasks.id,
      task_judul: tasks.judul,
      task_service_type: tasks.service_type,
      task_status: tasks.status,
      task_due_date: tasks.due_date,
      task_deskripsi: tasks.deskripsi,
      magic_link_expires_at: tasks.magic_link_expires_at,
      asset_nama: assets.nama,
      asset_category: assets.category,
      staf_nama: users.nama,
    })
    .from(tasks)
    .leftJoin(assets, eq(tasks.asset_id, assets.id))
    .leftJoin(users, eq(tasks.assigned_to, users.id))
    .where(eq(tasks.magic_link_token, token))
    .limit(1);

  const task = result[0];

  if (!task) {
    return (
      <div style={{
        minHeight: "100vh", background: "linear-gradient(135deg, #fef2f2 0%, #fff 50%, #fef2f2 100%)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
      }}>
        <div style={{
          background: "#fff", borderRadius: 24, padding: "2.5rem 2rem",
          maxWidth: 400, width: "100%", textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
          <h1 style={{ fontWeight: 800, fontSize: "1.1rem", color: "#0f172a", marginBottom: "0.75rem" }}>
            Link Tidak Ditemukan
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
            Magic link ini tidak valid atau sudah diperbarui oleh pemilik aset.
          </p>
        </div>
      </div>
    );
  }

  // Cek kadaluarsa
  const isExpired = task.magic_link_expires_at && new Date() > task.magic_link_expires_at;
  if (isExpired) {
    return (
      <div style={{
        minHeight: "100vh", background: "linear-gradient(135deg, #fffbeb 0%, #fff 50%, #fffbeb 100%)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
      }}>
        <div style={{
          background: "#fff", borderRadius: 24, padding: "2.5rem 2rem",
          maxWidth: 400, width: "100%", textAlign: "center",
          boxShadow: "0 20px 60px rgba(245,158,11,0.1)",
          border: "1px solid rgba(245,158,11,0.15)",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏱️</div>
          <h1 style={{ fontWeight: 800, fontSize: "1.1rem", color: "#0f172a", marginBottom: "0.75rem" }}>
            Link Sudah Kadaluarsa
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.6 }}>
            Magic link berlaku selama 30 hari. Minta link baru dari pemilik aset.
          </p>
        </div>
      </div>
    );
  }

  const categoryIcon: Record<string, string> = {
    PROPERTY: "🏠", VEHICLE: "🚗", ELECTRONIC: "💻", LUXURY_GOODS: "💎",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(139,92,246,0.08) 0%, transparent 50%), #f3f4ff",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
    }}>
      <div style={{
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(20px)",
        borderRadius: 24, padding: "2.5rem 2rem",
        maxWidth: 420, width: "100%",
        boxShadow: "0 25px 80px rgba(99,102,241,0.15), 0 0 0 1px rgba(99,102,241,0.08)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
            marginBottom: "0.75rem",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#0f172a" }}>KeeperHub</div>
          <div style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em", color: "#6366f1" }}>AKSES STAF</div>
        </div>

        {/* Salam */}
        <div style={{
          textAlign: "center", marginBottom: "1.5rem",
          padding: "0.875rem",
          background: "rgba(99,102,241,0.05)",
          borderRadius: 14,
          border: "1px solid rgba(99,102,241,0.1)",
        }}>
          <p style={{ fontSize: "0.875rem", color: "#475569", marginBottom: 4 }}>
            Halo, <strong style={{ color: "#0f172a" }}>{task.staf_nama ?? "Staf"}</strong>!
          </p>
          <p style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
            Anda memiliki tugas yang perlu diselesaikan
          </p>
        </div>

        {/* Detail tugas */}
        <div style={{
          borderRadius: 16, overflow: "hidden",
          border: "1px solid rgba(99,102,241,0.12)",
          marginBottom: "1.5rem",
        }}>
          <div style={{
            height: 3,
            background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
          }} />
          <div style={{ padding: "1.125rem" }}>
            <div style={{
              fontSize: "0.68rem", fontWeight: 700, color: "#6366f1",
              background: "rgba(99,102,241,0.08)", padding: "0.25rem 0.6rem",
              borderRadius: 99, display: "inline-flex", alignItems: "center", gap: "0.3rem",
              marginBottom: "0.625rem",
              border: "1px solid rgba(99,102,241,0.15)",
            }}>
              {SERVICE_LABEL[task.task_service_type ?? ""] ?? task.task_service_type}
            </div>
            <h2 style={{
              fontWeight: 800, fontSize: "1rem", color: "#0f172a",
              marginBottom: "0.5rem", letterSpacing: "-0.2px",
            }}>
              {task.task_judul}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "#64748b" }}>
              <span>{categoryIcon[task.asset_category ?? ""] ?? "📦"}</span>
              <span>{task.asset_nama ?? "—"}</span>
            </div>
            {task.task_deskripsi && (
              <p style={{
                marginTop: "0.75rem", fontSize: "0.8rem", color: "#475569",
                lineHeight: 1.6, padding: "0.625rem", background: "#f8fafc",
                borderRadius: 10,
              }}>
                {task.task_deskripsi}
              </p>
            )}
            {task.task_due_date && (
              <div style={{
                marginTop: "0.625rem", display: "flex", alignItems: "center",
                gap: "0.375rem", fontSize: "0.75rem", color: "#f59e0b", fontWeight: 600,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Jatuh tempo: {task.task_due_date}
              </div>
            )}
          </div>
        </div>

        {/* Tombol utama */}
        <Link href={`/api/magic-link?token=${token}`} style={{
          display: "block", textAlign: "center",
          padding: "0.875rem 1.5rem",
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          color: "#fff", borderRadius: 14, textDecoration: "none",
          fontWeight: 800, fontSize: "0.95rem",
          boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
          letterSpacing: "-0.2px",
        }}>
          Masuk & Lihat Semua Tugas Saya →
        </Link>

        <p style={{
          textAlign: "center", fontSize: "0.7rem", color: "#94a3b8",
          marginTop: "1rem", lineHeight: 1.5,
        }}>
          Dengan mengklik tombol di atas, Anda akan masuk ke akun staf Anda.<br />
          Sesi berlaku 7 hari.
        </p>
      </div>
    </div>
  );
}

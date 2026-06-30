"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DeadlineAlert, LemonLawAlert } from "@/lib/radar";
import { formatRupiah } from "@/lib/validations";

type Notif = {
  id: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  task_id: string | null;
  asset_id: string | null;
  task_judul: string | null;
  task_status: string | null;
  task_submitted_cost: string | null;
  asset_nama: string | null;
  asset_category: string | null;
};

const NOTIF_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string; border: string; category: "kritis" | "peringatan" | "tugas" }> = {
  ALERT_MARKUP:        { label: "Peringatan Biaya Tinggi",        icon: "💰", color: "#dc2626", bg: "rgba(254,242,242,0.9)", border: "rgba(239,68,68,0.2)",   category: "kritis" },
  ALERT_LEMON_LAW:    { label: "Peringatan Lemon Law",            icon: "⚠️", color: "#dc2626", bg: "rgba(254,242,242,0.9)", border: "rgba(239,68,68,0.2)",   category: "kritis" },
  PAYWALL_TRIGGERED:  { label: "Batas Aset Tercapai",             icon: "🔒", color: "#d97706", bg: "rgba(255,251,235,0.9)", border: "rgba(245,158,11,0.2)", category: "peringatan" },
  TASK_ASSIGNED:      { label: "Tugas Baru Ditugaskan",           icon: "📋", color: "#6366f1", bg: "rgba(238,242,255,0.9)", border: "rgba(99,102,241,0.2)", category: "tugas" },
  APPROVAL_REQUESTED: { label: "Staf Meminta Persetujuan",        icon: "⏳", color: "#d97706", bg: "rgba(255,251,235,0.9)", border: "rgba(245,158,11,0.2)", category: "tugas" },
  TASK_APPROVED:      { label: "Tugas Disetujui",                 icon: "✅", color: "#059669", bg: "rgba(236,253,245,0.9)", border: "rgba(16,185,129,0.2)", category: "tugas" },
  TASK_REJECTED:      { label: "Tugas Ditolak",                   icon: "❌", color: "#dc2626", bg: "rgba(254,242,242,0.9)", border: "rgba(239,68,68,0.2)",  category: "tugas" },
};

const CATEGORY_ICON: Record<string, string> = {
  PROPERTY: "🏠", VEHICLE: "🚗", ELECTRONIC: "💻", LUXURY_GOODS: "💎",
};

export default function NotifikasiClient({
  notifList,
  deadlineAlerts,
  lemonAlerts,
  role,
}: {
  notifList: Notif[];
  deadlineAlerts: DeadlineAlert[];
  lemonAlerts: LemonLawAlert[];
  role: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [notifs, setNotifs] = useState(notifList);
  const [tab, setTab] = useState<"semua" | "belum_dibaca">("semua");

  const unread = notifs.filter((n) => !n.is_read).length;
  const displayed = tab === "belum_dibaca" ? notifs.filter((n) => !n.is_read) : notifs;

  async function markRead(id: string) {
    setLoading(id);
    try {
      await fetch("/api/notifikasi", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    } finally {
      setLoading(null);
    }
  }

  async function markAllRead() {
    setLoading("all");
    try {
      await fetch("/api/notifikasi", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  const hasAlerts = lemonAlerts.length > 0 || deadlineAlerts.length > 0;
  const totalKritis = lemonAlerts.length + notifs.filter(n => ["ALERT_MARKUP", "ALERT_LEMON_LAW"].includes(n.notification_type) && !n.is_read).length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginBottom: 6, letterSpacing: "-0.4px" }}>
            Radar Intelijen
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
            {unread > 0 ? `${unread} notifikasi belum dibaca` : "Semua notifikasi sudah dibaca"}
            {totalKritis > 0 && (
              <span style={{ marginLeft: 8, color: "#dc2626", fontWeight: 700 }}>
                · {totalKritis} peringatan kritis
              </span>
            )}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} disabled={loading === "all"} style={{
            padding: "0.55rem 1rem",
            background: "rgba(99,102,241,0.08)",
            border: "1.5px solid rgba(99,102,241,0.2)",
            borderRadius: 10, cursor: "pointer",
            color: "#6366f1", fontSize: "0.78rem", fontWeight: 700,
            display: "flex", alignItems: "center", gap: "0.35rem",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            {loading === "all" ? "Memproses..." : "Tandai Semua Dibaca"}
          </button>
        )}
      </div>

      {/* ── RADAR KRITIS: Lemon Law ─────────────────────────────── */}
      {role === "owner" && lemonAlerts.length > 0 && (
        <div style={{ marginBottom: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#dc2626", boxShadow: "0 0 0 3px rgba(220,38,38,0.2)" }} />
            <h2 style={{ fontWeight: 700, fontSize: "0.875rem", color: "#dc2626", letterSpacing: "0.3px" }}>
              PERINGATAN LEMON LAW
            </h2>
            <span style={{
              background: "#dc2626", color: "#fff",
              fontSize: "0.65rem", fontWeight: 800, padding: "0.15rem 0.5rem",
              borderRadius: 99,
            }}>{lemonAlerts.length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {lemonAlerts.map((a) => (
              <div key={a.asset_id} style={{
                background: "rgba(255,255,255,0.95)",
                border: "1.5px solid rgba(239,68,68,0.25)",
                borderRadius: 14,
                overflow: "hidden",
                boxShadow: "0 2px 12px rgba(220,38,38,0.08)",
              }}>
                <div style={{ height: 3, background: "linear-gradient(90deg, #dc2626, #ef4444)" }} />
                <div style={{ padding: "1rem 1.125rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                        <span style={{ fontSize: "1rem" }}>{CATEGORY_ICON[a.asset_category] ?? "📦"}</span>
                        <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>{a.asset_nama}</span>
                        <span style={{
                          fontSize: "0.65rem", fontWeight: 700, color: "#dc2626",
                          background: "rgba(220,38,38,0.08)", padding: "0.2rem 0.5rem",
                          borderRadius: 99, border: "1px solid rgba(220,38,38,0.2)",
                        }}>LEMON LAW</span>
                      </div>
                      <p style={{ fontSize: "0.8rem", color: "#64748b", lineHeight: 1.5 }}>
                        Total biaya perawatan mencapai <strong style={{ color: "#dc2626" }}>{a.persen}%</strong> dari harga beli.
                        Pertimbangkan untuk mengganti atau menjual aset ini.
                      </p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{
                        fontSize: "1.35rem", fontWeight: 800, color: "#dc2626",
                        lineHeight: 1,
                      }}>{a.persen}%</div>
                      <div style={{ fontSize: "0.68rem", color: "#94a3b8", marginTop: 2 }}>dari harga beli</div>
                      <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#475569", marginTop: 4 }}>
                        {formatRupiah(a.total_maintenance_cost)}
                      </div>
                      <div style={{ fontSize: "0.68rem", color: "#94a3b8" }}>
                        / {formatRupiah(a.purchase_price)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── RADAR DEADLINE ─────────────────────────────────────── */}
      {role === "owner" && deadlineAlerts.length > 0 && (
        <div style={{ marginBottom: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#d97706", boxShadow: "0 0 0 3px rgba(217,119,6,0.2)" }} />
            <h2 style={{ fontWeight: 700, fontSize: "0.875rem", color: "#d97706", letterSpacing: "0.3px" }}>
              DEADLINE MENDEKATI
            </h2>
            <span style={{
              background: "#d97706", color: "#fff",
              fontSize: "0.65rem", fontWeight: 800, padding: "0.15rem 0.5rem",
              borderRadius: 99,
            }}>{deadlineAlerts.length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {deadlineAlerts.map((a, i) => {
              const isTax = a.jenis === "DEADLINE_TAX";
              const urgent = a.hari_tersisa <= 3;
              return (
                <div key={`${a.asset_id}-${a.jenis}`} style={{
                  background: "rgba(255,255,255,0.95)",
                  border: `1.5px solid ${urgent ? "rgba(220,38,38,0.25)" : "rgba(245,158,11,0.2)"}`,
                  borderRadius: 14, overflow: "hidden",
                  boxShadow: `0 2px 12px ${urgent ? "rgba(220,38,38,0.07)" : "rgba(245,158,11,0.07)"}`,
                }}>
                  <div style={{ height: 3, background: urgent ? "linear-gradient(90deg, #dc2626, #ef4444)" : "linear-gradient(90deg, #f59e0b, #fbbf24)" }} />
                  <div style={{ padding: "0.875rem 1.125rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                        <span style={{ fontSize: "1rem" }}>{CATEGORY_ICON[a.asset_category] ?? "📦"}</span>
                        <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#0f172a" }}>{a.asset_nama}</span>
                        <span style={{
                          fontSize: "0.65rem", fontWeight: 700,
                          color: isTax ? "#6366f1" : "#059669",
                          background: isTax ? "rgba(99,102,241,0.08)" : "rgba(5,150,105,0.08)",
                          padding: "0.2rem 0.5rem", borderRadius: 99,
                          border: `1px solid ${isTax ? "rgba(99,102,241,0.2)" : "rgba(5,150,105,0.2)"}`,
                        }}>
                          {isTax ? "📄 PAJAK" : "🛡️ GARANSI"}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.78rem", color: "#64748b" }}>
                        {isTax ? "Batas waktu pembayaran pajak" : "Masa garansi berakhir"} pada{" "}
                        <strong style={{ color: urgent ? "#dc2626" : "#0f172a" }}>
                          {new Date(a.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </strong>
                      </p>
                    </div>
                    <div style={{
                      textAlign: "center", flexShrink: 0,
                      padding: "0.5rem 0.875rem",
                      background: urgent ? "rgba(220,38,38,0.06)" : "rgba(245,158,11,0.06)",
                      borderRadius: 10,
                      border: `1px solid ${urgent ? "rgba(220,38,38,0.15)" : "rgba(245,158,11,0.15)"}`,
                    }}>
                      <div style={{
                        fontSize: "1.5rem", fontWeight: 800,
                        color: urgent ? "#dc2626" : "#d97706",
                        lineHeight: 1,
                      }}>{a.hari_tersisa}</div>
                      <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 600 }}>HARI LAGI</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Radar bersih untuk owner ────────────────────────────── */}
      {role === "owner" && !hasAlerts && (
        <div style={{
          background: "rgba(236,253,245,0.8)",
          border: "1.5px solid rgba(16,185,129,0.2)",
          borderRadius: 14, padding: "1rem 1.25rem",
          display: "flex", alignItems: "center", gap: "0.75rem",
          marginBottom: "1.75rem",
        }}>
          <span style={{ fontSize: "1.25rem" }}>🟢</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#059669" }}>Radar Bersih</div>
            <div style={{ fontSize: "0.78rem", color: "#6ee7b7" }}>
              Tidak ada deadline mendekati atau peringatan lemon law saat ini.
            </div>
          </div>
        </div>
      )}

      {/* ── NOTIFIKASI TUGAS ──────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366f1", boxShadow: "0 0 0 3px rgba(99,102,241,0.2)" }} />
        <h2 style={{ fontWeight: 700, fontSize: "0.875rem", color: "#6366f1", letterSpacing: "0.3px" }}>
          NOTIFIKASI AKTIVITAS
        </h2>
        {unread > 0 && (
          <span style={{
            background: "#6366f1", color: "#fff",
            fontSize: "0.65rem", fontWeight: 800, padding: "0.15rem 0.5rem",
            borderRadius: 99,
          }}>{unread}</span>
        )}
      </div>

      {/* Tab filter */}
      <div style={{ display: "flex", gap: "0.375rem", marginBottom: "1rem" }}>
        {(["semua", "belum_dibaca"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "0.4rem 0.875rem", borderRadius: 99,
            fontSize: "0.75rem", fontWeight: tab === t ? 700 : 500,
            border: tab === t ? "none" : "1.5px solid #e2e8f0",
            background: tab === t ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" : "rgba(255,255,255,0.8)",
            color: tab === t ? "#fff" : "#64748b",
            cursor: "pointer",
            boxShadow: tab === t ? "0 3px 8px rgba(99,102,241,0.25)" : "none",
          }}>
            {t === "semua" ? `Semua (${notifs.length})` : `Belum Dibaca (${unread})`}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <div style={{
          background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)",
          borderRadius: 20, border: "2px dashed rgba(99,102,241,0.2)",
          padding: "4rem 2rem", textAlign: "center",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
            {tab === "belum_dibaca" ? "✅" : "📭"}
          </div>
          <p style={{ color: "#475569", fontSize: "0.9rem", fontWeight: 600 }}>
            {tab === "belum_dibaca" ? "Tidak ada notifikasi yang belum dibaca" : "Belum ada notifikasi"}
          </p>
          <p style={{ color: "#94a3b8", fontSize: "0.78rem", marginTop: "0.35rem" }}>
            {tab === "semua" ? "Notifikasi tugas dan peringatan akan muncul di sini." : ""}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {displayed.map((notif) => {
            const cfg = NOTIF_CONFIG[notif.notification_type];
            if (!cfg) return null;
            return (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && markRead(notif.id)}
                style={{
                  background: notif.is_read ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.95)",
                  border: notif.is_read ? "1px solid rgba(226,232,240,0.6)" : `1.5px solid ${cfg.border}`,
                  borderRadius: 14, overflow: "hidden",
                  boxShadow: notif.is_read
                    ? "none"
                    : "0 2px 12px rgba(99,102,241,0.06)",
                  cursor: notif.is_read ? "default" : "pointer",
                  transition: "opacity 0.2s",
                  opacity: loading === notif.id ? 0.6 : 1,
                }}
              >
                {/* Left accent bar */}
                <div style={{ display: "flex" }}>
                  <div style={{
                    width: 3, flexShrink: 0,
                    background: notif.is_read ? "#e2e8f0" : cfg.color,
                  }} />
                  <div style={{ flex: 1, padding: "0.875rem 1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                          <span style={{ fontSize: "0.95rem" }}>{cfg.icon}</span>
                          <span style={{
                            fontSize: "0.75rem", fontWeight: 700,
                            color: notif.is_read ? "#94a3b8" : cfg.color,
                          }}>
                            {cfg.label}
                          </span>
                          {!notif.is_read && (
                            <span style={{
                              width: 6, height: 6, borderRadius: "50%",
                              background: cfg.color, flexShrink: 0,
                            }} />
                          )}
                        </div>
                        {notif.task_judul && (
                          <div style={{
                            fontWeight: 600, fontSize: "0.85rem",
                            color: notif.is_read ? "#64748b" : "#0f172a",
                            marginBottom: "0.2rem",
                          }}>
                            {notif.task_judul}
                          </div>
                        )}
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                          {notif.asset_nama && (
                            <span>
                              {CATEGORY_ICON[notif.asset_category ?? ""] ?? "📦"} {notif.asset_nama}
                            </span>
                          )}
                          {notif.task_submitted_cost && notif.notification_type === "ALERT_MARKUP" && (
                            <span style={{ color: "#dc2626", fontWeight: 600 }}>
                              · Biaya: {formatRupiah(Number(notif.task_submitted_cost))}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                          {notif.created_at}
                        </div>
                        {!notif.is_read && (
                          <div style={{
                            marginTop: 4, fontSize: "0.65rem", fontWeight: 600,
                            color: "#6366f1",
                          }}>
                            Klik untuk tandai dibaca
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

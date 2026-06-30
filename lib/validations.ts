// ── Validasi format Indonesia ────────────────────────────────────

/**
 * Normalisasi nomor HP Indonesia ke format +62xxxxxxxxxx
 * Menerima: 08xx, 628xx, +628xx
 */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/[\s\-().]/g, "");
  if (/^\+628[1-9]\d{7,11}$/.test(digits)) return digits;
  if (/^628[1-9]\d{7,11}$/.test(digits)) return `+${digits}`;
  if (/^08[1-9]\d{7,11}$/.test(digits)) return `+62${digits.slice(1)}`;
  return null; // format tidak valid
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Tentukan apakah identifier adalah email atau nomor HP
 */
export function detectIdentifierType(identifier: string): "email" | "phone" | null {
  if (isValidEmail(identifier)) return "email";
  const normalized = normalizePhone(identifier);
  if (normalized) return "phone";
  return null;
}

// ── Format tampilan ──────────────────────────────────────────────

/** Format Rupiah: Rp 1.250.000 */
export function formatRupiah(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/** Format tanggal panjang Indonesia: 12 Januari 2026 */
export function formatTanggal(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(d);
}

/** Format DD/MM/YYYY */
export function formatTanggalPendek(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(d);
}

/** Format persentase Indonesia: 12,5% */
export function formatPersen(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

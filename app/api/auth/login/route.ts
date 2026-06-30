import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq, or } from "drizzle-orm";
import { verifyPassword, signToken, setAuthCookie } from "@/lib/auth";
import { normalizePhone, isValidEmail } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier?.trim() || !password) {
      return NextResponse.json(
        { pesan: "Email/nomor HP dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    // ── Deteksi apakah identifier adalah email atau HP ───────────
    const trimmed = identifier.trim();
    let user = null;

    if (isValidEmail(trimmed)) {
      // Login via email
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, trimmed.toLowerCase()))
        .limit(1);
      user = result[0] ?? null;
    } else {
      // Login via nomor HP
      const normalizedPhone = normalizePhone(trimmed);
      if (!normalizedPhone) {
        return NextResponse.json(
          { pesan: "Format email atau nomor HP tidak valid." },
          { status: 400 }
        );
      }
      const result = await db
        .select()
        .from(users)
        .where(eq(users.phone, normalizedPhone))
        .limit(1);
      user = result[0] ?? null;
    }

    // ── Pesan error generik — jangan bocorkan mana yang salah ────
    const errGeneric = { pesan: "Email/nomor HP atau kata sandi salah." };

    if (!user) {
      return NextResponse.json(errGeneric, { status: 401 });
    }

    const passwordOk = await verifyPassword(password, user.password_hash);
    if (!passwordOk) {
      return NextResponse.json(errGeneric, { status: 401 });
    }

    // ── Buat sesi JWT ────────────────────────────────────────────
    const token = signToken({
      userId: user.id,
      role: user.role,
      subscriptionTier: user.subscription_tier,
    });
    setAuthCookie(token);

    return NextResponse.json({
      pesan: "Masuk berhasil.",
      user: {
        id: user.id,
        nama: user.nama,
        role: user.role,
        subscription_tier: user.subscription_tier,
        wizard_step: user.wizard_step,
      },
    });
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json(
      { pesan: "Terjadi kesalahan server. Coba lagi." },
      { status: 500 }
    );
  }
}

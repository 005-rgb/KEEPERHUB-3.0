import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq, or } from "drizzle-orm";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";
import { normalizePhone, isValidEmail, isValidPassword } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama, email, phone: rawPhone, password } = body;

    // ── Validasi input wajib ────────────────────────────────────
    if (!nama?.trim()) {
      return NextResponse.json({ pesan: "Nama wajib diisi." }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ pesan: "Kata sandi wajib diisi." }, { status: 400 });
    }
    if (!isValidPassword(password)) {
      return NextResponse.json(
        { pesan: "Kata sandi minimal 8 karakter." },
        { status: 400 }
      );
    }
    if (!email && !rawPhone) {
      return NextResponse.json(
        { pesan: "Email atau nomor HP wajib diisi." },
        { status: 400 }
      );
    }

    // ── Validasi & normalisasi email/HP ─────────────────────────
    let normalizedEmail: string | null = null;
    let normalizedPhone: string | null = null;

    if (email) {
      if (!isValidEmail(email)) {
        return NextResponse.json({ pesan: "Format email tidak valid." }, { status: 400 });
      }
      normalizedEmail = email.trim().toLowerCase();
    }

    if (rawPhone) {
      normalizedPhone = normalizePhone(rawPhone);
      if (!normalizedPhone) {
        return NextResponse.json(
          { pesan: "Format nomor HP tidak valid. Gunakan format 08xx atau +628xx." },
          { status: 400 }
        );
      }
    }

    // ── Cek duplikat email/HP ────────────────────────────────────
    const conditions = [];
    if (normalizedEmail) conditions.push(eq(users.email, normalizedEmail));
    if (normalizedPhone) conditions.push(eq(users.phone, normalizedPhone));

    if (conditions.length > 0) {
      const existing = await db
        .select({ id: users.id, email: users.email, phone: users.phone })
        .from(users)
        .where(or(...conditions))
        .limit(1);

      if (existing.length > 0) {
        const field =
          existing[0].email === normalizedEmail ? "Email" : "Nomor HP";
        return NextResponse.json(
          { pesan: `${field} sudah terdaftar. Silakan masuk.` },
          { status: 409 }
        );
      }
    }

    // ── Simpan user baru ─────────────────────────────────────────
    const passwordHash = await hashPassword(password);
    const [newUser] = await db
      .insert(users)
      .values({
        nama: nama.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        password_hash: passwordHash,
        role: "owner",
        subscription_tier: "free",
        wizard_step: 1,
      })
      .returning({ id: users.id, role: users.role, subscription_tier: users.subscription_tier });

    // ── Buat sesi JWT ────────────────────────────────────────────
    const token = signToken({
      userId: newUser.id,
      role: newUser.role,
      subscriptionTier: newUser.subscription_tier,
    });
    setAuthCookie(token);

    return NextResponse.json(
      { pesan: "Akun berhasil dibuat.", userId: newUser.id },
      { status: 201 }
    );
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json(
      { pesan: "Terjadi kesalahan server. Coba lagi." },
      { status: 500 }
    );
  }
}

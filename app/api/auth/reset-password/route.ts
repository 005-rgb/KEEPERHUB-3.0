import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";
import { isValidPassword } from "@/lib/validations";
import { sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { pesan: "Token dan kata sandi baru wajib diisi." },
        { status: 400 }
      );
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { pesan: "Kata sandi minimal 8 karakter." },
        { status: 400 }
      );
    }

    // Ambil token — pastikan belum dipakai dan belum expired
    const rows = await db.execute(
      sql`SELECT id, user_id, expires_at, used_at
          FROM password_reset_tokens
          WHERE token = ${token}
          LIMIT 1`
    );

    const tokenRow = (rows as any).rows?.[0];

    if (!tokenRow) {
      return NextResponse.json(
        { pesan: "Link reset tidak valid atau sudah kadaluarsa." },
        { status: 400 }
      );
    }

    if (tokenRow.used_at) {
      return NextResponse.json(
        { pesan: "Link reset ini sudah pernah digunakan." },
        { status: 400 }
      );
    }

    if (new Date(tokenRow.expires_at) < new Date()) {
      return NextResponse.json(
        { pesan: "Link reset sudah kadaluarsa. Minta link baru." },
        { status: 400 }
      );
    }

    // Hash kata sandi baru
    const newHash = await hashPassword(password);

    // Update password dan tandai token sudah dipakai
    await db
      .update(users)
      .set({ password_hash: newHash, updated_at: new Date() })
      .where(eq(users.id, tokenRow.user_id));

    await db.execute(
      sql`UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ${tokenRow.id}`
    );

    return NextResponse.json({ pesan: "Kata sandi berhasil diperbarui. Silakan masuk." });
  } catch (err) {
    console.error("[reset-password]", err);
    return NextResponse.json(
      { pesan: "Terjadi kesalahan server. Coba lagi." },
      { status: 500 }
    );
  }
}

// Validasi token (GET) — dipakai halaman reset untuk cek token sebelum render form
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) {
      return NextResponse.json({ valid: false, pesan: "Token tidak ditemukan." });
    }

    const rows = await db.execute(
      sql`SELECT expires_at, used_at
          FROM password_reset_tokens
          WHERE token = ${token}
          LIMIT 1`
    );

    const tokenRow = (rows as any).rows?.[0];

    if (!tokenRow) {
      return NextResponse.json({ valid: false, pesan: "Link tidak valid." });
    }
    if (tokenRow.used_at) {
      return NextResponse.json({ valid: false, pesan: "Link sudah pernah digunakan." });
    }
    if (new Date(tokenRow.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, pesan: "Link sudah kadaluarsa." });
    }

    return NextResponse.json({ valid: true });
  } catch (err) {
    console.error("[reset-password GET]", err);
    return NextResponse.json({ valid: false, pesan: "Terjadi kesalahan server." });
  }
}

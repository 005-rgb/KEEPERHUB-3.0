import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { isValidEmail } from "@/lib/validations";
import { sendPasswordResetEmail } from "@/lib/mailer";
import crypto from "crypto";
import { sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email?.trim() || !isValidEmail(email.trim())) {
      return NextResponse.json(
        { pesan: "Masukkan alamat email yang valid." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const result = await db
      .select({ id: users.id, nama: users.nama, email: users.email })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    // Selalu return 200 — jangan bocorkan apakah email terdaftar
    if (result.length === 0) {
      return NextResponse.json({
        pesan: "Jika email terdaftar, link reset akan dikirim dalam beberapa menit.",
      });
    }

    const user = result[0];

    // Hapus token lama yang belum digunakan untuk email ini
    await db.execute(
      sql`DELETE FROM password_reset_tokens WHERE user_id = ${user.id} AND used_at IS NULL`
    );

    // Buat token baru (hex 32 byte = 64 karakter)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

    await db.execute(
      sql`INSERT INTO password_reset_tokens (user_id, token, expires_at)
          VALUES (${user.id}, ${token}, ${expiresAt.toISOString()})`
    );

    // Bangun URL reset
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      (req.headers.get("x-forwarded-host")
        ? `https://${req.headers.get("x-forwarded-host")}`
        : `http://${req.headers.get("host")}`);

    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    await sendPasswordResetEmail(user.email!, user.nama, resetUrl);

    return NextResponse.json({
      pesan: "Jika email terdaftar, link reset akan dikirim dalam beberapa menit.",
    });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json(
      { pesan: "Terjadi kesalahan server. Coba lagi." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { tasks, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { getUserFromCookie } from "@/lib/server-auth";
import { signToken } from "@/lib/auth";
import crypto from "crypto";

// POST /api/magic-link — generate/regenerate token untuk sebuah task (owner only)
export async function POST(req: NextRequest) {
  const auth = getUserFromCookie();
  if (!auth) return NextResponse.json({ pesan: "Tidak terautentikasi." }, { status: 401 });
  if (auth.role !== "owner") {
    return NextResponse.json({ pesan: "Hanya owner yang dapat membuat magic link." }, { status: 403 });
  }

  const body = await req.json();
  const { task_id } = body;
  if (!task_id) return NextResponse.json({ pesan: "task_id wajib diisi." }, { status: 400 });

  // Pastikan task milik owner ini
  const [task] = await db
    .select({
      id: tasks.id,
      judul: tasks.judul,
      assigned_to: tasks.assigned_to,
      owner_id: tasks.owner_id,
    })
    .from(tasks)
    .where(eq(tasks.id, task_id))
    .limit(1);

  if (!task) return NextResponse.json({ pesan: "Tugas tidak ditemukan." }, { status: 404 });
  if (task.owner_id !== auth.userId) {
    return NextResponse.json({ pesan: "Akses ditolak." }, { status: 403 });
  }

  // Generate token unik
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 hari

  await db.update(tasks).set({
    magic_link_token: token,
    magic_link_expires_at: expires,
    updated_at: new Date(),
  }).where(eq(tasks.id, task_id));

  const appUrl = process.env.NEXTAUTH_URL || `https://${req.headers.get("host")}`;
  const magicUrl = `${appUrl}/magic?token=${token}`;

  return NextResponse.json({
    token,
    url: magicUrl,
    expires_at: expires.toISOString(),
    staf_id: task.assigned_to,
  });
}

// GET /api/magic-link?token=xxx — aktivasi: set cookie, redirect ke dashboard
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/magic?error=token_hilang", req.url));
  }

  // Cari task berdasarkan token
  const [task] = await db
    .select({
      id: tasks.id,
      assigned_to: tasks.assigned_to,
      magic_link_expires_at: tasks.magic_link_expires_at,
    })
    .from(tasks)
    .where(eq(tasks.magic_link_token, token))
    .limit(1);

  if (!task) {
    return NextResponse.redirect(new URL("/magic?error=token_tidak_valid", req.url));
  }

  // Cek kadaluarsa
  if (task.magic_link_expires_at && new Date() > task.magic_link_expires_at) {
    return NextResponse.redirect(new URL("/magic?error=token_kadaluarsa", req.url));
  }

  // Ambil data staf
  const [staf] = await db
    .select({ id: users.id, role: users.role, subscription_tier: users.subscription_tier })
    .from(users)
    .where(eq(users.id, task.assigned_to))
    .limit(1);

  if (!staf) {
    return NextResponse.redirect(new URL("/magic?error=staf_tidak_ditemukan", req.url));
  }

  // Buat JWT session
  const jwt = signToken({
    userId: staf.id,
    role: staf.role,
    subscriptionTier: staf.subscription_tier,
  });

  const res = NextResponse.redirect(new URL("/dashboard/tugas", req.url));
  res.cookies.set("keeperhub_token", jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
    path: "/",
  });

  return res;
}

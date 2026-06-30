import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { getUserFromCookie } from "@/lib/server-auth";
import { hashPassword } from "@/lib/auth";
import { isValidEmail, normalizePhone } from "@/lib/validations";

// GET /api/staf — daftar semua user dengan role=staff
export async function GET() {
  const auth = getUserFromCookie();
  if (!auth) return NextResponse.json({ pesan: "Tidak terautentikasi." }, { status: 401 });
  if (auth.role !== "owner" && auth.role !== "sub_owner") {
    return NextResponse.json({ pesan: "Akses ditolak." }, { status: 403 });
  }

  const daftar = await db
    .select({
      id: users.id,
      nama: users.nama,
      phone: users.phone,
      email: users.email,
      created_at: users.created_at,
    })
    .from(users)
    .where(eq(users.role, "staff"));

  return NextResponse.json({ data: daftar });
}

// POST /api/staf — tambah staf baru (owner only)
export async function POST(req: NextRequest) {
  const auth = getUserFromCookie();
  if (!auth) return NextResponse.json({ pesan: "Tidak terautentikasi." }, { status: 401 });
  if (auth.role !== "owner") {
    return NextResponse.json({ pesan: "Hanya owner yang dapat menambah staf." }, { status: 403 });
  }

  const body = await req.json();
  const { nama, email, phone, password } = body;

  if (!nama?.trim()) return NextResponse.json({ pesan: "Nama wajib diisi." }, { status: 400 });
  if (!password || password.length < 8) return NextResponse.json({ pesan: "Kata sandi minimal 8 karakter." }, { status: 400 });
  if (!email && !phone) return NextResponse.json({ pesan: "Email atau nomor HP wajib diisi." }, { status: 400 });

  if (email && !isValidEmail(email)) return NextResponse.json({ pesan: "Format email tidak valid." }, { status: 400 });

  let normalizedPhone: string | null = null;
  if (phone) {
    normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) return NextResponse.json({ pesan: "Format nomor HP tidak valid. Gunakan 08xx atau +628xx." }, { status: 400 });
  }

  // Cek duplikat email
  if (email) {
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) return NextResponse.json({ pesan: "Email sudah terdaftar." }, { status: 409 });
  }

  const password_hash = await hashPassword(password);

  const [newStaf] = await db.insert(users).values({
    nama: nama.trim(),
    email: email?.trim() || null,
    phone: normalizedPhone,
    password_hash,
    role: "staff",
    subscription_tier: "free",
    wizard_step: 1,
  }).returning({ id: users.id, nama: users.nama });

  return NextResponse.json({ data: newStaf }, { status: 201 });
}

// DELETE /api/staf?id=xxx — hapus staf (owner only)
export async function DELETE(req: NextRequest) {
  const auth = getUserFromCookie();
  if (!auth) return NextResponse.json({ pesan: "Tidak terautentikasi." }, { status: 401 });
  if (auth.role !== "owner") {
    return NextResponse.json({ pesan: "Hanya owner yang dapat menghapus staf." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ pesan: "ID staf wajib diisi." }, { status: 400 });

  await db.delete(users).where(eq(users.id, id));
  return NextResponse.json({ ok: true });
}

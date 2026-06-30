import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { getUserFromCookie } from "@/lib/server-auth";

// GET /api/staf — daftar semua user dengan role=staff (untuk dropdown form tugas)
export async function GET() {
  const auth = getUserFromCookie();
  if (!auth) return NextResponse.json({ pesan: "Tidak terautentikasi." }, { status: 401 });
  if (auth.role !== "owner" && auth.role !== "sub_owner") {
    return NextResponse.json({ pesan: "Akses ditolak." }, { status: 403 });
  }

  const daftar = await db
    .select({ id: users.id, nama: users.nama, phone: users.phone, email: users.email })
    .from(users)
    .where(eq(users.role, "staff"));

  return NextResponse.json({ data: daftar });
}

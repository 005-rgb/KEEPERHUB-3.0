import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { tasks, assets, users, notifications } from "@/server/db/schema";
import { eq, or, and, desc } from "drizzle-orm";
import { getUserFromCookie } from "@/lib/server-auth";
import { randomBytes } from "crypto";

const VALID_SERVICE_TYPES = [
  "ROUTINE_SCHEDULED", "REPAIR_BREAKDOWN", "CLEANING_DETAILING",
  "UPGRADE_MODIFICATION", "INSPECTION_CERTIFICATION",
];

// ── GET /api/tugas — daftar tugas ──────────────────────────────
export async function GET(req: NextRequest) {
  const auth = getUserFromCookie();
  if (!auth) return NextResponse.json({ pesan: "Tidak terautentikasi." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status");

  // Owner lihat semua tugas miliknya; staff lihat tugas yang diterima
  const baseWhere = auth.role === "owner" || auth.role === "sub_owner"
    ? eq(tasks.owner_id, auth.userId)
    : eq(tasks.assigned_to, auth.userId);

  const whereClause = statusFilter
    ? and(baseWhere, eq(tasks.status, statusFilter as any))
    : baseWhere;

  const rows = await db
    .select({
      id: tasks.id,
      judul: tasks.judul,
      deskripsi: tasks.deskripsi,
      service_type: tasks.service_type,
      status: tasks.status,
      due_date: tasks.due_date,
      submitted_cost: tasks.submitted_cost,
      approved_cost: tasks.approved_cost,
      staff_notes: tasks.staff_notes,
      owner_notes: tasks.owner_notes,
      magic_link_token: tasks.magic_link_token,
      created_at: tasks.created_at,
      updated_at: tasks.updated_at,
      // Aset
      asset_id: tasks.asset_id,
      asset_nama: assets.nama,
      asset_category: assets.category,
      // Staf
      assigned_to: tasks.assigned_to,
      staf_nama: users.nama,
      staf_phone: users.phone,
    })
    .from(tasks)
    .leftJoin(assets, eq(tasks.asset_id, assets.id))
    .leftJoin(users, eq(tasks.assigned_to, users.id))
    .where(whereClause)
    .orderBy(desc(tasks.created_at));

  return NextResponse.json({ data: rows });
}

// ── POST /api/tugas — buat tugas baru (owner only) ─────────────
export async function POST(req: NextRequest) {
  const auth = getUserFromCookie();
  if (!auth) return NextResponse.json({ pesan: "Tidak terautentikasi." }, { status: 401 });
  if (auth.role !== "owner") {
    return NextResponse.json({ pesan: "Hanya owner yang dapat membuat tugas." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { asset_id, assigned_to, service_type, judul, deskripsi, due_date } = body;

    // Validasi
    if (!asset_id) return NextResponse.json({ pesan: "Aset wajib dipilih." }, { status: 400 });
    if (!assigned_to) return NextResponse.json({ pesan: "Staf yang ditugaskan wajib dipilih." }, { status: 400 });
    if (!VALID_SERVICE_TYPES.includes(service_type)) {
      return NextResponse.json({ pesan: "Jenis servis tidak valid." }, { status: 400 });
    }
    if (!judul?.trim()) return NextResponse.json({ pesan: "Judul tugas wajib diisi." }, { status: 400 });

    // Pastikan aset milik owner ini
    const [aset] = await db.select({ id: assets.id }).from(assets)
      .where(and(eq(assets.id, asset_id), eq(assets.owner_id, auth.userId))).limit(1);
    if (!aset) return NextResponse.json({ pesan: "Aset tidak ditemukan atau bukan milik Anda." }, { status: 404 });

    // Pastikan staf valid
    const [staf] = await db.select({ id: users.id, nama: users.nama })
      .from(users).where(and(eq(users.id, assigned_to), eq(users.role, "staff"))).limit(1);
    if (!staf) return NextResponse.json({ pesan: "Staf tidak ditemukan." }, { status: 404 });

    // Generate magic link token (untuk akses WA tanpa login)
    const magic_link_token = randomBytes(24).toString("hex");
    const magic_link_expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 hari

    // Buat tugas
    const [newTask] = await db.insert(tasks).values({
      owner_id: auth.userId,
      asset_id,
      assigned_to,
      service_type,
      judul: judul.trim(),
      deskripsi: deskripsi?.trim() || null,
      due_date: due_date || null,
      status: "ditugaskan",
      magic_link_token,
      magic_link_expires_at,
    }).returning({ id: tasks.id, judul: tasks.judul });

    // Kirim notifikasi TASK_ASSIGNED ke staf
    await db.insert(notifications).values({
      owner_id: auth.userId,
      recipient_user_id: assigned_to,
      asset_id,
      task_id: newTask.id,
      notification_type: "TASK_ASSIGNED",
    });

    return NextResponse.json(
      { pesan: "Tugas berhasil dibuat.", data: newTask },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/tugas]", err);
    return NextResponse.json({ pesan: "Terjadi kesalahan server." }, { status: 500 });
  }
}

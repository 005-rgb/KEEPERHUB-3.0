import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { tasks, assets, notifications } from "@/server/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getUserFromCookie } from "@/lib/server-auth";

// ── PATCH /api/tugas/[id] — transisi status tugas ──────────────
//
// Aksi yang diizinkan:
//   [staff]  submit_selesai  → ditugaskan  → menunggu_persetujuan
//   [owner]  setujui         → menunggu_persetujuan → disetujui
//   [owner]  tolak           → menunggu_persetujuan → ditolak
//   [owner]  selesaikan      → disetujui → selesai  (update total_maintenance_cost)

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = getUserFromCookie();
  if (!auth) return NextResponse.json({ pesan: "Tidak terautentikasi." }, { status: 401 });

  const { id } = params;
  const body = await req.json();
  const { aksi, submitted_cost, staff_notes, approved_cost, owner_notes } = body;

  // Ambil tugas lengkap + info aset
  const [tugas] = await db
    .select({
      id: tasks.id,
      owner_id: tasks.owner_id,
      assigned_to: tasks.assigned_to,
      asset_id: tasks.asset_id,
      status: tasks.status,
      submitted_cost: tasks.submitted_cost,
      asset_category: assets.category,
    })
    .from(tasks)
    .leftJoin(assets, eq(tasks.asset_id, assets.id))
    .where(eq(tasks.id, id))
    .limit(1);

  if (!tugas) return NextResponse.json({ pesan: "Tugas tidak ditemukan." }, { status: 404 });

  // ── STAF: Submit selesai ────────────────────────────────────────
  if (aksi === "submit_selesai") {
    if (auth.userId !== tugas.assigned_to) {
      return NextResponse.json({ pesan: "Hanya staf yang ditugaskan yang dapat submit." }, { status: 403 });
    }
    if (tugas.status !== "ditugaskan" && tugas.status !== "ditolak") {
      return NextResponse.json({ pesan: "Status tugas tidak dapat diubah saat ini." }, { status: 409 });
    }
    if (!submitted_cost || isNaN(Number(submitted_cost)) || Number(submitted_cost) < 0) {
      return NextResponse.json({ pesan: "Biaya yang diajukan wajib diisi." }, { status: 400 });
    }

    await db.update(tasks).set({
      status: "menunggu_persetujuan",
      submitted_cost: String(submitted_cost),
      staff_notes: staff_notes?.trim() || null,
      updated_at: new Date(),
    }).where(eq(tasks.id, id));

    // Notifikasi APPROVAL_REQUESTED ke owner
    await db.insert(notifications).values({
      owner_id: tugas.owner_id,
      recipient_user_id: tugas.owner_id,
      asset_id: tugas.asset_id,
      task_id: tugas.id,
      notification_type: "APPROVAL_REQUESTED",
    });

    // Cek ALERT_MARKUP: biaya >3jt untuk VEHICLE atau ELECTRONIC
    const biaya = Number(submitted_cost);
    if (biaya > 3_000_000 && (tugas.asset_category === "VEHICLE" || tugas.asset_category === "ELECTRONIC")) {
      await db.insert(notifications).values({
        owner_id: tugas.owner_id,
        recipient_user_id: tugas.owner_id,
        asset_id: tugas.asset_id,
        task_id: tugas.id,
        notification_type: "ALERT_MARKUP",
      });
    }

    return NextResponse.json({ pesan: "Pengajuan berhasil dikirim, menunggu persetujuan owner." });
  }

  // ── OWNER: Setujui ─────────────────────────────────────────────
  if (aksi === "setujui") {
    if (auth.userId !== tugas.owner_id) {
      return NextResponse.json({ pesan: "Hanya owner yang dapat menyetujui tugas." }, { status: 403 });
    }
    if (tugas.status !== "menunggu_persetujuan") {
      return NextResponse.json({ pesan: "Tugas belum dalam status menunggu persetujuan." }, { status: 409 });
    }

    await db.update(tasks).set({
      status: "disetujui",
      approved_cost: approved_cost ? String(approved_cost) : tugas.submitted_cost,
      owner_notes: owner_notes?.trim() || null,
      updated_at: new Date(),
    }).where(eq(tasks.id, id));

    await db.insert(notifications).values({
      owner_id: tugas.owner_id,
      recipient_user_id: tugas.assigned_to,
      asset_id: tugas.asset_id,
      task_id: tugas.id,
      notification_type: "TASK_APPROVED",
    });

    return NextResponse.json({ pesan: "Tugas disetujui." });
  }

  // ── OWNER: Tolak ───────────────────────────────────────────────
  if (aksi === "tolak") {
    if (auth.userId !== tugas.owner_id) {
      return NextResponse.json({ pesan: "Hanya owner yang dapat menolak tugas." }, { status: 403 });
    }
    if (tugas.status !== "menunggu_persetujuan") {
      return NextResponse.json({ pesan: "Tugas belum dalam status menunggu persetujuan." }, { status: 409 });
    }
    if (!owner_notes?.trim()) {
      return NextResponse.json({ pesan: "Alasan penolakan wajib diisi." }, { status: 400 });
    }

    await db.update(tasks).set({
      status: "ditolak",
      owner_notes: owner_notes.trim(),
      updated_at: new Date(),
    }).where(eq(tasks.id, id));

    await db.insert(notifications).values({
      owner_id: tugas.owner_id,
      recipient_user_id: tugas.assigned_to,
      asset_id: tugas.asset_id,
      task_id: tugas.id,
      notification_type: "TASK_REJECTED",
    });

    return NextResponse.json({ pesan: "Tugas ditolak. Staf dapat mengajukan ulang." });
  }

  // ── OWNER: Selesaikan (finalisasi) ─────────────────────────────
  if (aksi === "selesaikan") {
    if (auth.userId !== tugas.owner_id) {
      return NextResponse.json({ pesan: "Hanya owner yang dapat menyelesaikan tugas." }, { status: 403 });
    }
    if (tugas.status !== "disetujui") {
      return NextResponse.json({ pesan: "Tugas harus disetujui terlebih dahulu." }, { status: 409 });
    }

    await db.update(tasks).set({
      status: "selesai",
      updated_at: new Date(),
    }).where(eq(tasks.id, id));

    // Tambahkan approved_cost ke total_maintenance_cost aset
    const biayaDisetujui = tugas.submitted_cost ? Number(tugas.submitted_cost) : 0;
    if (biayaDisetujui > 0 && tugas.asset_id) {
      await db.execute(
        sql`UPDATE assets SET total_maintenance_cost = total_maintenance_cost + ${biayaDisetujui}, updated_at = NOW() WHERE id = ${tugas.asset_id}`
      );
    }

    return NextResponse.json({ pesan: "Tugas selesai. Biaya perawatan aset diperbarui." });
  }

  return NextResponse.json({ pesan: "Aksi tidak dikenal." }, { status: 400 });
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { notifications, tasks, assets } from "@/server/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getUserFromCookie } from "@/lib/server-auth";

// GET /api/notifikasi — semua notifikasi untuk user yang login
export async function GET() {
  const auth = getUserFromCookie();
  if (!auth) return NextResponse.json({ pesan: "Tidak terautentikasi." }, { status: 401 });

  const rows = await db
    .select({
      id: notifications.id,
      notification_type: notifications.notification_type,
      is_read: notifications.is_read,
      created_at: notifications.created_at,
      task_id: notifications.task_id,
      asset_id: notifications.asset_id,
      task_judul: tasks.judul,
      task_status: tasks.status,
      task_submitted_cost: tasks.submitted_cost,
      asset_nama: assets.nama,
      asset_category: assets.category,
    })
    .from(notifications)
    .leftJoin(tasks, eq(notifications.task_id, tasks.id))
    .leftJoin(assets, eq(notifications.asset_id, assets.id))
    .where(eq(notifications.recipient_user_id, auth.userId))
    .orderBy(desc(notifications.created_at))
    .limit(100);

  const unread = rows.filter((r) => !r.is_read).length;

  return NextResponse.json({ data: rows, unread });
}

// PATCH /api/notifikasi — mark as read
export async function PATCH(req: NextRequest) {
  const auth = getUserFromCookie();
  if (!auth) return NextResponse.json({ pesan: "Tidak terautentikasi." }, { status: 401 });

  const body = await req.json();
  const { id, all } = body;

  if (all) {
    await db
      .update(notifications)
      .set({ is_read: true, updated_at: new Date() })
      .where(
        and(
          eq(notifications.recipient_user_id, auth.userId),
          eq(notifications.is_read, false)
        )
      );
    return NextResponse.json({ ok: true });
  }

  if (id) {
    await db
      .update(notifications)
      .set({ is_read: true, updated_at: new Date() })
      .where(
        and(eq(notifications.id, id), eq(notifications.recipient_user_id, auth.userId))
      );
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ pesan: "id atau all wajib diberikan." }, { status: 400 });
}

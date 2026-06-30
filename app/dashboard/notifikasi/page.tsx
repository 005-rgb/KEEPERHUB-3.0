import { redirect } from "next/navigation";
import { getUserFromHeaders } from "@/lib/server-auth";
import { db } from "@/server/db";
import { notifications, tasks, assets } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";
import { scanDeadlineAlerts, scanLemonLawAlerts } from "@/lib/radar";
import { formatTanggal } from "@/lib/validations";
import NotifikasiClient from "./NotifikasiClient";

export default async function RadarPage() {
  const auth = getUserFromHeaders();
  if (!auth) redirect("/login");

  // Notifikasi dari DB
  const notifRows = await db
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

  // Radar scan (computed, hanya untuk owner)
  const deadlineAlerts = auth.role === "owner"
    ? await scanDeadlineAlerts(auth.userId)
    : [];
  const lemonAlerts = auth.role === "owner"
    ? await scanLemonLawAlerts(auth.userId)
    : [];

  return (
    <NotifikasiClient
      notifList={notifRows.map((n) => ({
        ...n,
        created_at: formatTanggal(n.created_at),
        task_submitted_cost: n.task_submitted_cost ?? null,
      }))}
      deadlineAlerts={deadlineAlerts}
      lemonAlerts={lemonAlerts}
      role={auth.role}
    />
  );
}

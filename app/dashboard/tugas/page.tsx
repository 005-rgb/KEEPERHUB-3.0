import { redirect } from "next/navigation";
import { getUserFromHeaders } from "@/lib/server-auth";
import { db } from "@/server/db";
import { tasks, assets, users } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatRupiah, formatTanggalPendek } from "@/lib/validations";
import TugasClient from "./TugasClient";

export default async function TugasPage() {
  const auth = getUserFromHeaders();
  if (!auth) redirect("/login");

  // Ambil semua tugas milik owner, join asset + staf
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
      asset_id: tasks.asset_id,
      asset_nama: assets.nama,
      asset_category: assets.category,
      assigned_to: tasks.assigned_to,
      staf_nama: users.nama,
      staf_phone: users.phone,
    })
    .from(tasks)
    .leftJoin(assets, eq(tasks.asset_id, assets.id))
    .leftJoin(users, eq(tasks.assigned_to, users.id))
    .where(eq(tasks.owner_id, auth.userId))
    .orderBy(desc(tasks.created_at));

  return <TugasClient tugasList={rows} role={auth.role} ownerId={auth.userId} />;
}

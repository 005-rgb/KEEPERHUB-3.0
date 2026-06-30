import { redirect } from "next/navigation";
import { getUserFromHeaders } from "@/lib/server-auth";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { formatTanggal } from "@/lib/validations";
import StafClient from "./StafClient";

export default async function StafPage() {
  const auth = getUserFromHeaders();
  if (!auth) redirect("/login");
  if (auth.role !== "owner") redirect("/dashboard");

  const daftarStaf = await db
    .select({
      id: users.id,
      nama: users.nama,
      email: users.email,
      phone: users.phone,
      created_at: users.created_at,
    })
    .from(users)
    .where(eq(users.role, "staff"))
    .orderBy(users.created_at);

  return (
    <StafClient
      daftarStaf={daftarStaf.map((s) => ({
        ...s,
        created_at: formatTanggal(s.created_at),
      }))}
    />
  );
}

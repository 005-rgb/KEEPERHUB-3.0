import { db } from "@/server/db";
import { assets } from "@/server/db/schema";
import { eq, and, isNotNull, lte, sql } from "drizzle-orm";

export type DeadlineAlert = {
  asset_id: string;
  asset_nama: string;
  asset_category: string;
  jenis: "DEADLINE_TAX" | "DEADLINE_WARRANTY";
  deadline: string; // YYYY-MM-DD
  hari_tersisa: number;
};

export type LemonLawAlert = {
  asset_id: string;
  asset_nama: string;
  asset_category: string;
  purchase_price: number;
  total_maintenance_cost: number;
  persen: number;
};

// Scan deadline pajak & garansi yang jatuh dalam 14 hari ke depan (WIB)
export async function scanDeadlineAlerts(owner_id: string): Promise<DeadlineAlert[]> {
  const now = new Date();
  const batas = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const nowStr = now.toISOString().split("T")[0];
  const batasStr = batas.toISOString().split("T")[0];

  const rows = await db
    .select({
      id: assets.id,
      nama: assets.nama,
      category: assets.category,
      taxation_deadline: assets.taxation_deadline,
      warranty_end_date: assets.warranty_end_date,
    })
    .from(assets)
    .where(
      and(
        eq(assets.owner_id, owner_id),
        eq(assets.is_active, true)
      )
    );

  const alerts: DeadlineAlert[] = [];

  for (const a of rows) {
    if (a.taxation_deadline) {
      const deadlineDate = a.taxation_deadline; // string YYYY-MM-DD from date column
      if (deadlineDate >= nowStr && deadlineDate <= batasStr) {
        const diff = Math.ceil(
          (new Date(deadlineDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        alerts.push({
          asset_id: a.id,
          asset_nama: a.nama,
          asset_category: a.category,
          jenis: "DEADLINE_TAX",
          deadline: deadlineDate,
          hari_tersisa: Math.max(0, diff),
        });
      }
    }
    if (a.warranty_end_date) {
      const deadlineDate = a.warranty_end_date;
      if (deadlineDate >= nowStr && deadlineDate <= batasStr) {
        const diff = Math.ceil(
          (new Date(deadlineDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        alerts.push({
          asset_id: a.id,
          asset_nama: a.nama,
          asset_category: a.category,
          jenis: "DEADLINE_WARRANTY",
          deadline: deadlineDate,
          hari_tersisa: Math.max(0, diff),
        });
      }
    }
  }

  return alerts;
}

// Scan lemon law: total_maintenance_cost > 30% dari purchase_price
export async function scanLemonLawAlerts(owner_id: string): Promise<LemonLawAlert[]> {
  const rows = await db
    .select({
      id: assets.id,
      nama: assets.nama,
      category: assets.category,
      purchase_price: assets.purchase_price,
      total_maintenance_cost: assets.total_maintenance_cost,
    })
    .from(assets)
    .where(
      and(
        eq(assets.owner_id, owner_id),
        eq(assets.is_active, true),
        sql`CAST(${assets.total_maintenance_cost} AS numeric) > 0`
      )
    );

  return rows
    .map((a) => ({
      asset_id: a.id,
      asset_nama: a.nama,
      asset_category: a.category,
      purchase_price: Number(a.purchase_price),
      total_maintenance_cost: Number(a.total_maintenance_cost),
      persen: Number(a.purchase_price) > 0
        ? Math.round((Number(a.total_maintenance_cost) / Number(a.purchase_price)) * 100)
        : 0,
    }))
    .filter((a) => a.persen >= 30);
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { assets, users } from "@/server/db/schema";
import { eq, count, and } from "drizzle-orm";
import { getUserFromCookie } from "@/lib/server-auth";

// Batas aset per tier
const ASSET_LIMIT: Record<string, number> = {
  free: 3,
  personal: 999,
  family_office: 999,
  enterprise: 999,
};

// ── GET /api/assets — daftar aset milik owner ───────────────────
export async function GET(req: NextRequest) {
  const user = getUserFromCookie();
  if (!user) return NextResponse.json({ pesan: "Tidak terautentikasi." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("kategori");

  const where = category
    ? and(eq(assets.owner_id, user.userId), eq(assets.category, category as any), eq(assets.is_active, true))
    : and(eq(assets.owner_id, user.userId), eq(assets.is_active, true));

  const data = await db
    .select({
      id: assets.id,
      category: assets.category,
      nama: assets.nama,
      deskripsi: assets.deskripsi,
      purchase_price: assets.purchase_price,
      purchase_date: assets.purchase_date,
      current_value: assets.current_value,
      total_maintenance_cost: assets.total_maintenance_cost,
      taxation_deadline: assets.taxation_deadline,
      warranty_end_date: assets.warranty_end_date,
      photo_url: assets.photo_url,
      created_at: assets.created_at,
    })
    .from(assets)
    .where(where)
    .orderBy(assets.created_at);

  return NextResponse.json({ data });
}

// ── POST /api/assets — tambah aset baru ────────────────────────
export async function POST(req: NextRequest) {
  const user = getUserFromCookie();
  if (!user) return NextResponse.json({ pesan: "Tidak terautentikasi." }, { status: 401 });

  try {
    const body = await req.json();
    const { category, nama, deskripsi, purchase_price, purchase_date, current_value,
            taxation_deadline, warranty_end_date, photo_url } = body;

    // ── Validasi wajib ───────────────────────────────────────────
    const VALID_CATEGORIES = ["PROPERTY", "VEHICLE", "ELECTRONIC", "LUXURY_GOODS"];
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ pesan: "Kategori aset tidak valid." }, { status: 400 });
    }
    if (!nama?.trim()) {
      return NextResponse.json({ pesan: "Nama aset wajib diisi." }, { status: 400 });
    }
    if (!purchase_price || isNaN(Number(purchase_price)) || Number(purchase_price) <= 0) {
      return NextResponse.json({ pesan: "Harga beli harus diisi dan lebih dari 0." }, { status: 400 });
    }

    // ── Cek paywall free tier (maks 3 aset) ─────────────────────
    const limit = ASSET_LIMIT[user.subscriptionTier] ?? 3;
    const [{ total }] = await db
      .select({ total: count() })
      .from(assets)
      .where(and(eq(assets.owner_id, user.userId), eq(assets.is_active, true)));

    if (Number(total) >= limit) {
      return NextResponse.json(
        {
          pesan: `Paket ${user.subscriptionTier === "free" ? "Gratis" : user.subscriptionTier} hanya dapat menyimpan ${limit} aset. Upgrade paket untuk menambah lebih banyak.`,
          kode: "PAYWALL_TRIGGERED",
        },
        { status: 403 }
      );
    }

    // ── Simpan aset ──────────────────────────────────────────────
    const [newAsset] = await db
      .insert(assets)
      .values({
        owner_id: user.userId,
        category,
        nama: nama.trim(),
        deskripsi: deskripsi?.trim() || null,
        purchase_price: String(purchase_price),
        purchase_date: purchase_date || null,
        current_value: current_value ? String(current_value) : null,
        total_maintenance_cost: "0",
        taxation_deadline: taxation_deadline || null,
        warranty_end_date: warranty_end_date || null,
        photo_url: photo_url || null,
      })
      .returning({ id: assets.id, nama: assets.nama, category: assets.category });

    return NextResponse.json({ pesan: "Aset berhasil ditambahkan.", data: newAsset }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/assets]", err);
    return NextResponse.json({ pesan: "Terjadi kesalahan server." }, { status: 500 });
  }
}

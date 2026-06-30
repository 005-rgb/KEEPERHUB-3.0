/**
 * Helper untuk membaca user dari request header di Server Components & Route Handlers.
 * Diisi oleh middleware.ts setelah verifikasi JWT.
 */
import { headers } from "next/headers";
import { cookies } from "next/headers";
import { verifyToken, type JwtPayload } from "./auth";

export function getUserFromHeaders(): JwtPayload | null {
  const h = headers();
  const userId = h.get("x-user-id");
  const role = h.get("x-user-role") as JwtPayload["role"] | null;
  const subscriptionTier = h.get("x-user-tier");
  if (!userId || !role || !subscriptionTier) return null;
  return { userId, role, subscriptionTier };
}

/** Fallback: baca langsung dari cookie (untuk API routes) */
export function getUserFromCookie(): JwtPayload | null {
  const token = cookies().get("keeperhub_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

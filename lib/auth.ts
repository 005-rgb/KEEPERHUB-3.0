import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "keeperhub-dev-secret-ganti-di-production";
const COOKIE_NAME = "keeperhub_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

export type JwtPayload = {
  userId: string;
  role: "owner" | "staff" | "sub_owner";
  subscriptionTier: string;
};

// ── Hash & verify password ──────────────────────────────────────
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ── JWT ─────────────────────────────────────────────────────────
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

// ── Cookie helper ────────────────────────────────────────────────
export function setAuthCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export function clearAuthCookie() {
  cookies().set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
}

export function getAuthToken(): string | undefined {
  return cookies().get(COOKIE_NAME)?.value;
}

export function getCurrentUser(): JwtPayload | null {
  const token = getAuthToken();
  if (!token) return null;
  return verifyToken(token);
}

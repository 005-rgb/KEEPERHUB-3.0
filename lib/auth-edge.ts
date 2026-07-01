import { jwtVerify } from "jose";

export type JwtPayload = {
  userId: string;
  role: "owner" | "staff" | "sub_owner";
  subscriptionTier: string;
};

const JWT_SECRET = process.env.JWT_SECRET || "keeperhub-dev-secret-ganti-di-production";

export async function verifyTokenEdge(token: string): Promise<JwtPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload.userId as string,
      role: payload.role as JwtPayload["role"],
      subscriptionTier: payload.subscriptionTier as string,
    };
  } catch {
    return null;
  }
}

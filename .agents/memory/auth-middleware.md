---
name: Auth & Middleware
description: JWT cookie session, middleware route protection, header-based user extraction, and critical Edge Runtime fix.
---

## Cookie & JWT
- Cookie name: `keeperhub_token`, HTTP-only, 7-day expiry
- JWT payload: `{ userId, role, subscriptionTier }`
- `lib/auth.ts` — `signToken()`, `verifyToken()`, `hashPassword()`, `comparePassword()`, `setAuthCookie()`, `clearAuthCookie()`

## Middleware (middleware.ts)
- Public paths: `/login`, `/register`, `/api/auth/*`, `/_next/*`, `/favicon`
- Everything else → verify JWT → redirect `/login` if invalid/missing
- Sets `x-user-id`, `x-user-role`, `x-user-tier` headers on valid requests

## CRITICAL: Edge Runtime Fix (jsonwebtoken → jose)
`jsonwebtoken` does NOT work in Next.js Edge Runtime (where middleware.ts always runs). `jwt.verify()` fails silently, causing ALL authenticated requests to redirect to /login even with a valid cookie.

**Fix applied:** Created `lib/auth-edge.ts` using `jose` (`jwtVerify`) which is Edge-compatible. Middleware imports `verifyTokenEdge` from there — NOT from `lib/auth.ts`.

**Rule:** Any JWT verification in `middleware.ts` must use `lib/auth-edge.ts`. Signing and Node.js-side verification (Route Handlers) continue using `lib/auth.ts` with `jsonwebtoken`.

## Server-side User Extraction
- Server Components & layouts: `getUserFromHeaders()` reads headers set by middleware
- API Route Handlers: `getUserFromCookie()` reads JWT cookie directly (headers not set for API routes)

**Why:** Next.js middleware runs before both API routes and pages, but only page requests have the x-user-* headers propagated reliably. API routes must re-read the cookie.

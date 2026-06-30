---
name: Auth & Middleware
description: JWT cookie session, middleware route protection, and header-based user extraction pattern.
---

## Cookie & JWT
- Cookie name: `keeperhub_token`, HTTP-only, 7-day expiry
- JWT payload: `{ userId, role, subscriptionTier }`
- `lib/auth.ts` — `signToken()`, `verifyToken()`, `hashPassword()`, `comparePassword()`, `setAuthCookie()`, `clearAuthCookie()`

## Middleware (middleware.ts)
- Public paths: `/login`, `/register`, `/api/auth/*`, `/_next/*`, `/favicon`
- Everything else → verify JWT → redirect `/login` if invalid/missing
- Sets `x-user-id`, `x-user-role`, `x-user-tier` headers on valid requests

## Server-side User Extraction
- Server Components & layouts: `getUserFromHeaders()` reads headers set by middleware
- API Route Handlers: `getUserFromCookie()` reads JWT cookie directly (headers not set for API routes)

**Why:** Next.js middleware runs before both API routes and pages, but only page requests have the x-user-* headers propagated reliably. API routes must re-read the cookie.

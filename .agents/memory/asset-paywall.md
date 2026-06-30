---
name: Asset Paywall
description: Free-tier asset limit enforcement with PAYWALL_TRIGGERED error code.
---

## Limits per tier
| Tier | Maks aset |
|------|-----------|
| free | 3 |
| personal | 999 (tak terbatas) |
| family_office | 999 |
| enterprise | 999 |

## Enforcement
- Checked in `POST /api/assets` before insert
- Returns HTTP 403 + `{ kode: "PAYWALL_TRIGGERED", pesan: "..." }` when limit reached
- Dashboard shows paywall warning banner when `totalAset >= limit`
- UI `TambahAsetForm` displays the error message from API response (including PAYWALL_TRIGGERED pesan)

**Why:** PRD defines PAYWALL_TRIGGERED as a notification type AND an API error code. Treat them as the same concept — the API error triggers the notification downstream.

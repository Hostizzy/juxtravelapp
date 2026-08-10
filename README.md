# JuxTravel

JuxTravel is a homestay booking platform connecting travellers with verified independent hosts. The platform consists of a guest/host mobile app, a backend API, and an admin panel for operations and moderation.

## Monorepo Structure

```
juxtravelapp/
  apps/
    mobile/     React Native (Expo) app — Guest and Host modes
    backend/    NestJS API
    admin/      Next.js admin panel
```

Managed as a pnpm workspace with Turborepo.

## Tech Stack

### Mobile (apps/mobile)
- Expo SDK 54 (React Native 0.81)
- TypeScript
- React Navigation
- Supabase (auth session, storage)
- TanStack Query
- Zustand (state management)
- Razorpay (in-app checkout)
- expo-secure-store (token storage)
- i18n-js (English + Hindi)

### Backend (apps/backend)
- NestJS 11
- TypeScript
- Supabase (Postgres + Auth + Storage)
- class-validator / class-transformer (request validation)
- Razorpay (payments, webhook verification)
- Instagram Graph API integration (host reels import)
- @nestjs/throttler (rate limiting)
- helmet

### Admin (apps/admin)
- Next.js 16
- TypeScript
- Supabase (service-role access)
- zod (request validation)
- TanStack Query
- JWT-based admin authentication

## Prerequisites
- Node.js 22+
- pnpm 10+
- A Supabase project
- Razorpay account (test or live keys)
- Meta developer app with Instagram Graph API access (for host Instagram import)

## Getting Started

### 1. Install dependencies
```bash
pnpm install
```

### 2. Configure environment variables

Each app has its own `.env.example` — copy it and fill in real values:

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/mobile/.env.example apps/mobile/.env
cp apps/admin/.env.example apps/admin/.env
```

See the Environment Variables section below for what each variable is for.

### 3. Run database migrations

Apply the SQL migrations under `apps/backend` (or the project's migrations folder) against your Supabase project before starting the backend.

### 4. Run the apps

```bash
# Backend API
cd apps/backend
pnpm run start:dev

# Admin panel
cd apps/admin
pnpm run dev

# Mobile app
cd apps/mobile
pnpm start
```

## Environment Variables

### apps/backend/.env
| Variable | Purpose |
|---|---|
| `PORT` | API port |
| `NODE_ENV` | `development` / `production` |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase access |
| `JWT_SECRET` | User auth token signing |
| `ADMIN_JWT_SECRET` | Admin auth token signing (separate from `JWT_SECRET`) |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Payment processing |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook signature verification |
| `INSTAGRAM_APP_ID` / `INSTAGRAM_APP_SECRET` | Instagram OAuth |
| `INSTAGRAM_REDIRECT_URI` | Instagram OAuth callback URL |
| `INSTAGRAM_TOKEN_ENCRYPTION_KEY` | Encrypts stored Instagram access tokens at rest |

### apps/mobile/.env
| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase public client key |
| `EXPO_PUBLIC_BACKEND_URL` | Backend API base URL |

### apps/admin/.env
| Variable | Purpose |
|---|---|
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase access |
| `ADMIN_JWT_SECRET` | Must match backend's `ADMIN_JWT_SECRET` |
| `BACKEND_URL` | Backend API base URL |

Exact variable names should be verified against each app's `.env.example` file, which is the source of truth.

## Core Modules

| Area | Description |
|---|---|
| Auth | Supabase-backed authentication, OTP login |
| Properties | Host property listings, photos, availability |
| Bookings | Date selection, price calculation, booking lifecycle |
| Payments | Razorpay order creation, signature verification, webhooks |
| Verification | Guest KYC and host property verification |
| Instagram | Host Instagram account linking, reel import for property media |
| Discover | Guest-facing content feed (reels, stories) |
| Conversations | In-app messaging between guests and hosts |
| Admin | Moderation, verification review, booking oversight |

## Architecture Notes
- All Supabase access from the mobile app goes through the backend API — the mobile client does not talk to Supabase with elevated privileges.
- Pricing is always recalculated server-side; client-submitted amounts are validated against the server calculation before a payment order is created.
- Booking status transitions are guarded against concurrent/duplicate webhook and client confirmation events.
- Styles are kept in separate `.styles.ts` files per screen in the mobile app.

## License
Proprietary — all rights reserved.

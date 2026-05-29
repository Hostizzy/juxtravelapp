# JuxTravel

## About
JuxTravel — React Native mobile app for Indian travellers. AI-matched homestay bookings. Guest + Host modes in single codebase.

## What is Done So Far

### Monorepo Setup
- Turborepo + pnpm workspaces
- apps/ and packages/ structure
- turbo.json configured
- pnpm-workspace.yaml configured

### Mobile App (apps/mobile)
- Expo SDK 54 + TypeScript strict
- React Navigation v7
- Firebase JS SDK v12.13.0
- AsyncStorage for auth persistence
- i18n localization (EN + HI)
- Separate styles pattern (.styles.ts)

### Screens Completed
- G01 Splash Screen
- G02 Login Screen (Phone + Google UI)
- G03 OTP Verify Screen

### Auth
- Firebase Phone OTP via REST API
- Google Login UI (production pending)
- AsyncStorage auth persistence

### Localization
- i18n-js setup
- English (en.json)
- Hindi (hi.json)
- All screen text localized

### Security
- .env setup with all Firebase keys
- .gitignore configured
- google-services.json gitignored
- .env never committed

## How to Run

### Prerequisites
- Node.js v22.17.1
- pnpm v10.25.0
- Expo Go app on Android phone

### Setup
```bash
git clone <repo-url>
cd juxtravelapp
pnpm install
cd apps/mobile
cp .env.example .env
# Fill .env with Firebase values
pnpm start
# Scan QR with Expo Go
```

## Environment Variables
apps/mobile/.env:
```env
FIREBASE_WEB_CLIENT_ID=
FIREBASE_API_KEY=
FIREBASE_PROJECT_ID=
FIREBASE_AUTH_DOMAIN=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
```

## Pending
- Google Login (production build)
- Backend NestJS (apps/backend)
- AI Service FastAPI (apps/ai-service)
- Admin Panel Next.js (apps/admin)
- Remaining 14 Guest screens
- 13 Host screens
- Razorpay payments
- WhatsApp Business API
- EAS Build setup

## Last Updated
May 27, 2026

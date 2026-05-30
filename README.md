# JuxTravel

## About
JuxTravel is a React Native mobile app (iOS + Android) where Indian travellers describe their trip and get AI-matched with verified homestay hosts. Single codebase with Guest + Host modes.

---

## Project Structure
```
juxtravelapp/
  apps/
    mobile/          ← React Native app
      src/
        features/
          auth/
            splash/  ← G01 Splash Screen
            login/   ← G02 Login Screen
            otp/     ← G03 OTP Screen
          home/      ← G04 Home Screen
          plan/      ← G05-G08 Plan Flow
          discover/  ← G14-G15 Discover
          profile/   ← G16 Guest Profile
          host/
            onboarding/   ← H01 Host Onboarding
            verification/ ← H02 Verification
            welcome/      ← H03 Host Welcome
            dashboard/    ← H04 Host Dashboard
            bookings/     ← H05 Host Bookings
            listProperty/ ← H06-H10 List Property
            reviewPending/← H11 Review Pending
            profile/      ← H12 Host Profile
        navigation/
          GuestNavigator.tsx ← Guest bottom nav
          HostNavigator.tsx  ← Host bottom nav
          RootNavigator.tsx  ← Root stack
        services/
          firebase.ts    ← Firebase init
          phoneAuth.ts   ← OTP auth
          userService.ts ← Firestore user ops
          api.ts         ← Backend API calls
        stores/
          authStore.ts   ← Zustand auth store
        locales/
          en.json        ← English
          hi.json        ← Hindi
        types/
          env.d.ts       ← Env type declarations
    backend/         ← NestJS API
      src/
        modules/
          auth/      ← Token verify + user sync
          users/     ← User CRUD + become host
        firebase/    ← Firebase Admin SDK
        common/      ← Guards, filters, decorators
        config/      ← App configuration
  packages/
    types/           ← Shared types (future)
```

---

## Tech Stack

### Mobile (apps/mobile)
| Package | Version | Purpose |
|---------|---------|---------|
| Expo SDK | 54 | RN framework |
| TypeScript | strict | Type safety |
| React Navigation | v7 | Navigation |
| Firebase JS SDK | 12.13.0 | Auth |
| Zustand | latest | State management |
| AsyncStorage | latest | Local persistence |
| i18n-js | latest | Localization |
| expo-localization | latest | Device locale |
| @expo/vector-icons | latest | Icons |
| react-native-webview | latest | Auth flows |

### Backend (apps/backend)
| Package | Version | Purpose |
|---------|---------|---------|
| NestJS | latest | Backend framework |
| TypeScript | strict | Type safety |
| Firebase Admin SDK | latest | Firestore + Auth |
| class-validator | latest | Input validation |
| helmet | latest | Security |
| @nestjs/throttler | latest | Rate limiting |

---

## Prerequisites
- Node.js v22.17.1+
- pnpm v10.25.0+
- Expo Go app on Android phone
- Git v2.51+

---

## Setup Instructions

### 1. Clone Repository
```bash
git clone https://github.com/Hostizzy/juxtravelapp.git
cd juxtravelapp
```

### 2. Install All Dependencies
```bash
pnpm install
```

### 3. Mobile Setup
```bash
cd apps/mobile
cp .env.example .env
# Fill .env with Firebase values
# See SETUP_BACKEND.md for details
```

### 4. Backend Setup
```bash
cd apps/backend
cp .env.example .env
# Fill .env with Firebase Admin SDK values
# See SETUP_BACKEND.md for details
```

### 5. Run Backend (Terminal 1)
```bash
cd apps/backend
pnpm run dev
# Runs on http://localhost:3000
```

### 6. Run Mobile (Terminal 2)
```bash
cd apps/mobile
pnpm start
# Scan QR with Expo Go
```

---

## Environment Variables

### apps/mobile/.env
```env
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
FIREBASE_WEB_CLIENT_ID=
BACKEND_URL=http://10.0.2.2:3000/api/v1
```

### apps/backend/.env
```env
PORT=3000
NODE_ENV=development
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
JWT_SECRET=
```

---

## API Endpoints

### Auth (No auth required)
`POST /api/v1/auth/verify`

**Body:**
```json
{
  "idToken": "string",
  "name": "string",
  "phoneNumber": "string"
}
```

**Response:**
```json
{
  "uid": "string",
  "name": "string",
  "role": "guest | host | both",
  "guestProfile": {
    "savedProperties": [],
    "tripBriefs": []
  },
  "hostProfile": null
}
```

### Users (Firebase token required)
`GET /api/v1/users/me`

**Headers:**
`Authorization: Bearer <token>`

**Response:** Full user document

`PATCH /api/v1/users/me`

**Headers:**
`Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "string",
  "email": "string"
}
```

`POST /api/v1/users/become-host`

**Headers:**
`Authorization: Bearer <token>`

**Body:**
```json
{
  "bio": "string"
}
```

**Response:** User with `hostProfile` added

---

## Firestore Data Structure

### users/{uid}
```json
{
  "uid": "string",
  "name": "string",
  "phoneNumber": "string",
  "email": "string?",
  "role": "guest | host | both",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp",
  "guestProfile": {
    "savedProperties": ["string"],
    "tripBriefs": ["string"]
  },
  "hostProfile": {
    "verified": "boolean",
    "verificationStatus": "pending | approved | rejected",
    "bio": "string",
    "hostStory": "string",
    "payoutDetails": {}
  }
}
```

### User → Host Flow (Firestore)
1. User logs in (Phone OTP)
   → `users/{uid}` created with `role: 'guest'`
2. User clicks "Become a Host"
   → `POST /api/v1/users/become-host`
   → `role` updated to `'both'`
   → `hostProfile` added to same document
3. Host completes verification
   → `hostProfile.verificationStatus: 'pending'`
4. Admin approves
   → `hostProfile.verified: true`
   → `hostProfile.verificationStatus: 'approved'`

### properties/{propertyId} (coming soon)
### bookings/{bookingId} (coming soon)
### tripBriefs/{briefId} (coming soon)

---

## Screens Status

### Guest Screens
| ID | Screen | Status | Notes |
|----|--------|--------|-------|
| G01 | Splash Screen | ✅ Done | Animated dots |
| G02 | Login Screen | ✅ Done | Phone + Google UI |
| G03 | OTP Verify | ✅ Done | 6-digit + timer |
| G04 | Home Screen | ✅ Done | Trips, Moments, Trending |
| G05 | Plan Step 1 | ✅ Done | Where & When |
| G06 | Plan Step 2 | ✅ Done | Who's coming |
| G07 | Plan Step 3 | ✅ Done | Experience/Mood |
| G08 | Plan Step 4 | ✅ Done | Budget & Extras |
| G09 | Match Results | ⏳ Pending | AI matches |
| G10 | Property Detail | ⏳ Pending | Host page |
| G11 | Group Voting | ⏳ Pending | Trip board |
| G12 | Booking | ⏳ Pending | Razorpay |
| G13 | Confirmation | ⏳ Pending | Success |
| G14 | Discover Reels | ✅ Done | Full screen reels |
| G15 | Discover Stories | ✅ Done | Stories + Moments |
| G16 | Guest Profile | ✅ Done | 4 tabs + Become Host |

### Host Screens
| ID | Screen | Status | Notes |
|----|--------|--------|-------|
| H01 | Host Onboarding | ✅ Done | 3 slides, swipeable |
| H02 | Host Verification | ✅ Done | Property type, capacity, docs |
| H03 | Host Welcome | ✅ Done | Checklist + dashboard CTA |
| H04 | Host Dashboard | ✅ Done | Stats, properties, bookings |
| H05 | Host Bookings | ✅ Done | Filter tabs, booking cards |
| H06 | List Property 1 | ✅ Done | Basic info + property type |
| H07 | List Property 2 | ✅ Done | Details + amenities |
| H08 | List Property 3 | ✅ Done | Photos + reels + Instagram |
| H09 | List Property 4 | ✅ Done | Experiences + AI story |
| H10 | List Property 5 | ✅ Done | Availability + pricing |
| H11 | Review Pending | ✅ Done | Submission confirmation |
| H12 | Host Profile | ✅ Done | 4 tabs + switch to guest |

### Backend
| Module | Status | Notes |
|--------|--------|-------|
| NestJS scaffold | ✅ Done | Complete setup |
| Firebase Admin | ✅ Done | Auth + Firestore |
| Auth guard | ✅ Done | Token verification |
| POST /auth/verify | ✅ Done | Login + user sync |
| GET /users/me | ✅ Done | Get user profile |
| PATCH /users/me | ✅ Done | Update profile |
| POST /users/become-host | ✅ Done | Role upgrade |
| Properties API | ⏳ Pending | Host listing |
| Bookings API | ⏳ Pending | Payment flow |
| AI Service | ⏳ Pending | FastAPI |
| Admin Panel | ⏳ Pending | Next.js |

---

## Pending Features
- [ ] Auto login fix
- [ ] Google Login (EAS production build)
- [ ] Match Results screen
- [ ] Property Detail screen  
- [ ] Group Voting screen
- [ ] Booking + Razorpay payments
- [ ] AI match scoring (FastAPI)
- [ ] WhatsApp Business API
- [ ] Push notifications (FCM)
- [ ] Admin panel (Next.js)
- [ ] EAS Build (iOS + Android)
- [ ] Production deployment (Railway)

---

## Architecture Rules
1. Firebase NEVER accessed from mobile directly
2. All Firestore operations via NestJS backend
3. Mobile sends Firebase ID token to backend
4. Backend verifies → processes → returns data
5. Sensitive keys only in backend .env
6. Styles always in .styles.ts files
7. No inline styles in TSX files
8. TypeScript strict mode always
9. All text localized via i18n (EN + HI)
10. Separate folder per screen/feature

---

## Localization
Languages: English (en) + Hindi (hi)  
Files: `apps/mobile/src/locales/`
- `en.json` — English (default)
- `hi.json` — Hindi

---

## Last Updated
May 31, 2026

## Version
0.2.0 — Development

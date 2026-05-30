# JuxTravel — Backend Setup Guide
> Complete step-by-step guide for setting up Firebase and backend server. Follow each step in order. This is all a senior developer needs to get the full system running.

---

## What This Guide Covers
1. Firebase Console setup
2. Getting all required keys
3. Setting up mobile .env
4. Setting up backend .env
5. Running both servers
6. Verifying everything works

---

## Step 1 — Firebase Console Setup

### 1.1 Enable Firestore Database
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **juxtravelapp**
3. Left menu → **Firestore Database**
4. Click **Create database**
5. Select **Start in production mode**
6. Region: **asia-south1** (Mumbai)
7. Click **Enable**

### 1.2 Set Firestore Security Rules
1. Firestore → **Rules** tab
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    match /users/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
    
    match /properties/{propertyId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **Publish**

### 1.3 Enable Authentication
1. Left menu → **Authentication**
2. Click **Get started**
3. **Sign-in method** tab
4. Enable **Phone** → Toggle ON → Save
5. Enable **Google** → Toggle ON → Save

### 1.4 Add Test Phone Numbers
For development testing only:
1. Authentication → **Sign-in method**
2. Scroll down → **Phone numbers for testing**
3. Add:
   - Phone: `+91 9999999999`
   - OTP: `123456`
4. Click **Save**

---

## Step 2 — Get Mobile App Keys
These go in `apps/mobile/.env`

### 2.1 Web App Config
1. Firebase Console → **Project Settings** (gear icon)
2. **Your apps** section
3. **Web app** (`</>` icon)
   If none exists:
   - Add app → Web → Nickname: `juxtravelapp-web`
   - Register app
4. Copy these values:

```javascript
firebaseConfig = {
  apiKey: ""           // → FIREBASE_API_KEY
  authDomain: ""       // → FIREBASE_AUTH_DOMAIN
  projectId: ""        // → FIREBASE_PROJECT_ID
  storageBucket: ""    // → FIREBASE_STORAGE_BUCKET
  messagingSenderId: ""// → FIREBASE_MESSAGING_SENDER_ID
  appId: ""            // → FIREBASE_APP_ID
}
```

### 2.2 Web Client ID (Google Sign-In)
1. Authentication → **Sign-in method**
2. Click **Google**
3. **Web SDK configuration** section
4. Copy **Web client ID**
   - → `FIREBASE_WEB_CLIENT_ID`

---

## Step 3 — Get Backend Admin Keys
These go in `apps/backend/.env`

### 3.1 Firebase Admin SDK
The backend needs a Service Account to access Firestore securely.

#### Option A — Key Creation Allowed:
1. Firebase Console → **Project Settings**
2. **Service accounts** tab
3. **Generate new private key**
4. Download JSON file
5. From the JSON copy:
   - `project_id`    → `FIREBASE_PROJECT_ID`
   - `client_email`  → `FIREBASE_CLIENT_EMAIL`
   - `private_key`   → `FIREBASE_PRIVATE_KEY`

> [!IMPORTANT]
> **Instructions for FIREBASE_PRIVATE_KEY:**
> - Copy entire key with BEGIN/END lines
> - Keep on ONE line in `.env`
> - Keep `\n` characters as `\n` (not actual newlines)
> - Wrap in double quotes
>
> **Example:**
> `FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"`

#### Option B — If Key Creation Blocked:
Your organization has disabled service account key creation. Ask your Google Cloud admin to:
1. Go to Google Cloud Console
2. **IAM & Admin** → **Organization Policies**
3. Find: `iam.disableServiceAccountKeyCreation`
4. Override → **Allow**
5. Then follow Option A

### 3.2 JWT Secret
Generate any random string (min 32 chars):
- → `JWT_SECRET`

**Example:** 
```bash
openssl rand -base64 32
```

---

## Step 4 — Fill Environment Files

### apps/mobile/.env
Open `apps/mobile/.env` and fill:

```env
FIREBASE_API_KEY=           # (from Step 2.1)
FIREBASE_AUTH_DOMAIN=       # (from Step 2.1)
FIREBASE_PROJECT_ID=        # (from Step 2.1)
FIREBASE_STORAGE_BUCKET=    # (from Step 2.1)
FIREBASE_MESSAGING_SENDER_ID= # (from Step 2.1)
FIREBASE_APP_ID=            # (from Step 2.1)
FIREBASE_WEB_CLIENT_ID=     # (from Step 2.2)
BACKEND_URL=http://10.0.2.2:3000/api/v1
```

> [!NOTE]
> **About BACKEND_URL:**
> - Android Emulator: `http://10.0.2.2:3000/api/v1`
> - Physical Android device: `http://YOUR_PC_IP:3000/api/v1` (Find PC IP by running `ipconfig` in a terminal)

### apps/backend/.env
Open `apps/backend/.env` and fill:

```env
PORT=3000
NODE_ENV=development
FIREBASE_PROJECT_ID=    # (from Step 3.1)
FIREBASE_CLIENT_EMAIL=  # (from Step 3.1)
FIREBASE_PRIVATE_KEY=   # (from Step 3.1)
JWT_SECRET=             # (from Step 3.2)
```

---

## Step 5 — Run the System

### Terminal 1 — Backend
```bash
cd apps/backend
pnpm install
pnpm run dev
```

**Expected output:**
```
✓ Firebase Admin initialized
✓ Backend running on http://localhost:3000/api/v1
```

### Terminal 2 — Mobile
```bash
cd apps/mobile
pnpm install
pnpm start
```

Scan QR with Expo Go app.

---

## Step 6 — Test the Flow

### Test 1 — Phone Login
1. Open app on phone
2. Enter name + phone number
3. Use test number: `9999999999`
4. Enter OTP: `123456`
5. Should land on Home screen

### Test 2 — User Saved to Firestore
1. Firebase Console → **Firestore Database**
2. Click **users** collection
3. Should see document with your UID
4. Document has: name, phone, `role: guest`

### Test 3 — Become a Host
1. Go to **Profile** tab
2. Click **Become a Host**
3. Complete onboarding screens
4. Go back to Firestore
5. Same user document should now have:
   - `role`: `'both'`
   - `hostProfile`: `{ verified: false, ... }`

### Test 4 — Backend API
Open browser or Postman:
`GET http://localhost:3000/api/v1/users/me`  
**Headers:** `Authorization: Bearer YOUR_TOKEN`  
Should return user data.

---

## How User → Host Works

When user clicks Become a Host:
1. Mobile shows onboarding slides (H01)
2. User completes verification form (H02)
3. On submit → `POST /api/v1/users/become-host`
4. Backend updates Firestore:
   - `role`: `'guest'` → `'both'`  
   - `hostProfile` added to user document
5. User sees Welcome screen (H03)
6. Host Navigator loads (dark theme)
7. Same user, same UID, same document
8. Both guest and host data in one place

---

## Firestore User Document Example

After becoming a host, `users/{uid}` looks like:

```json
{
  "uid": "abc123",
  "name": "Lakshay Nagda",
  "phoneNumber": "+919876543210",
  "role": "both",
  "createdAt": "2026-05-31T...",
  "updatedAt": "2026-05-31T...",
  "guestProfile": {
    "savedProperties": [],
    "tripBriefs": []
  },
  "hostProfile": {
    "verified": false,
    "verificationStatus": "pending",
    "bio": "I love hosting travelers...",
    "hostStory": "",
    "payoutDetails": {}
  }
}
```

---

## Common Issues & Fixes

* **Issue:** App shows white screen after login
  * **Fix:** Check `BACKEND_URL` in mobile `.env`. Backend must be running first.
* **Issue:** `FIREBASE_PRIVATE_KEY` error
  * **Fix:** Wrap in double quotes in `.env`. Keep `\n` as `\n`, not real newlines.
* **Issue:** Cannot connect to backend
  * **Fix:** Physical device — use PC's IP, not `localhost`. Run `ipconfig` to find your IP.
* **Issue:** Firestore permission denied  
  * **Fix:** Check rules are published (Step 1.2).
* **Issue:** Phone OTP not working
  * **Fix:** Enable Phone auth (Step 1.3). Add test number (Step 1.4).
* **Issue:** User not saving to Firestore
  * **Fix:** Backend must be running. Check backend terminal for errors.

---

## Need Help?
Share with development team:
1. Screenshot of the error
2. Which step failed
3. Backend terminal output
4. Mobile `.env` (hide values, show keys only)

---

Last Updated: May 31, 2026  
Version: 0.2.0  

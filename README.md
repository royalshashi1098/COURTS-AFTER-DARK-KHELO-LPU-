# KHELO LPU — Sports Discovery & Facility Booking Platform

**KHELO LPU** is a premier sports-tech platform and installable Progressive Web App (PWA) designed specifically for students and sports staff at **Lovely Professional University (LPU)**, Punjab.

---

## 🚀 Key Features

1. **Verified Sports Directory**:
   - Comprehensive facility cards covering Badminton, Swimming, Football, Cricket, Basketball, Gymnasium, Squash, Tennis, Volleyball, Table Tennis, Martial Arts, and Athletics.
   - Official details verified against LPU Division of Student Welfare (DSW) bulletins: exact campus block locations, published court quantities, operating hours, shoe/equipment requirements, and direct Google Maps campus coordinates.
   - Distinct labeling for unverified data; no invented hours or locations.

2. **Smart Demonstration Booking Prototype**:
   - Guided 3-step reservation flow: Facility selection, date picker, 1-hour slot windows, and court selection.
   - **Real Conflict Checking**: Detects date, time slot, and court overlaps across all campus facilities in real-time.
   - **LPU Registration Validation**: Strictly enforces valid 8-digit LPU student registration numbers (e.g., `12201948`).
   - **Digital Sports Pass**: Generates an athletic boarding pass with booking token, court rules, turnstile entry instructions, and one-click demo slot cancellation to release spaces.

3. **Server-Side AI Sports Concierge (Gemini 3.8 Flash)**:
   - Natural language assistant for queries like *"Where can I play badminton this evening after 6 PM?"* or *"What shoes are needed for Block 28 Squash court?"*.
   - Uses `@google/genai` on a protected server route (`POST /api/ai/query`) with system instructions strictly grounded in verified LPU campus facilities.
   - **No API keys in client code**: Private keys remain server-side.
   - **Smart Offline Fallback Engine**: If the Gemini API key is absent or offline, an intelligent local campus rule engine provides accurate answers and attaches direct facility action cards.

4. **Sports Community & Find Players**:
   - Matchmaking board for student athletes to find doubles partners, 5v5 soccer players, or morning workout buddies.
   - Privacy-respecting in-app team-up invites (masked LPU student IDs, zero exposure of personal phone numbers).
   - Filter by sport, skill level (Beginner, Intermediate, Advanced, Varsity), and preferred play hours.

5. **Teams & Real-Time Tournament Brackets**:
   - Student team creation (Team name, Sport, Captain LPU ID, Jersey colors, and player roster).
   - Interactive playoff bracket visualizer (Quarterfinals -> Semifinals -> Finals) with live scores and venue designations.
   - In-app push alert simulation and browser Notification API reminders 30 minutes before match kickoff.

6. **Installable Progressive Web App (PWA)**:
   - Valid Web App Manifest (`id`, `name`, `short_name`, `theme_color: #080E1E`, `display: standalone`).
   - Standards-compliant PNG icons (`192x192`, `512x512`, `maskable`, `apple-touch-icon`).
   - Service worker with Workbox caching for safe public assets and offline capability.
   - In-app **Install App** button with platform-specific guidance for Android, Desktop, and iOS Safari.
   - Explicit disclaimer: Operates as a modern Progressive Web App, not an Android APK or iOS App Store binary.

7. **Admin Dashboard & Role Security**:
   - Server-enforced role checks via `x-user-role` header.
   - Facility status management (Available, Limited Slots, Maintenance, Events Only).
   - Audit log of demo bookings.
   - Referee desk to input official set scores and advance playoff match winners.

---

## 🛠 Local Setup & Running

### Prerequisites
- Node.js 22+ (tested on v22.23.3)
- npm

### Installation
```bash
# Clone the repository and install dependencies
npm install

# Start the full-stack development server (Express backend + Vite frontend)
npm run dev
```
The application will launch on `http://localhost:3000`.

### Running Unit Tests
Core business logic (conflict detection, slot capacity calculation, LPU registration validation, facility filtering, and tournament bracket progression) is decoupled and unit-tested using Node's native test runner:
```bash
npm test
```

### Production Build
```bash
# Build the production Vite bundle with PWA assets
npm run build

# Start the full-stack production server
npm start
```

---

## 📱 PWA Installation Instructions

### Android & Compatible Desktop Browsers (Chrome / Edge / Brave):
1. Click the **"Install App"** button in the header or the installation banner on the homepage.
2. In the browser dialog, click **"Install"**.
3. KHELO LPU will be added to your home screen or application launcher with standalone app windows.

### iOS Safari (iPhone / iPad):
1. Open the website in **Safari**.
2. Tap the **Share** button (box with upward arrow) in the bottom navigation bar.
3. Scroll down and select **"Add to Home Screen"**.
4. Tap **"Add"** in the top-right corner.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`:
```env
# Optional: GEMINI_API_KEY enables the Gemini 3.8 Flash AI concierge.
# If omitted, KHELO LPU automatically uses the built-in local knowledge engine.
GEMINI_API_KEY="your-gemini-api-key"

# Base URL of the deployed application
APP_URL="https://your-domain.run.app"
```

---

## 📊 Feature Status & Reality Checklist

| Feature | Status | Details |
| :--- | :--- | :--- |
| **Sports Directory** | ✅ **Live & Verified** | All 12 campus complexes are verified against LPU DSW bulletins. |
| **Booking Flow** | ✅ **Working Prototype** | Full conflict detection, court allocation, LPU ID check, and pass generation. |
| **Data Persistence** | 🟡 **Demonstration Memory** | Bookings and teams persist in the server process and local memory for demonstration purposes. |
| **University ERP Link** | ⚠️ **Simulated Disclaimer** | Clearly labeled as not connected to LPU's actual UMS/ERP internal servers. |
| **AI Assistant** | ✅ **Full-Stack Hybrid** | Server-side Gemini 3.8 Flash with local campus rule engine fallback. |
| **PWA & Offline** | ✅ **Production Ready** | Standards-compliant manifest, service worker, icons, and install prompt. |
| **Brackets & Teams** | ✅ **Interactive** | Teams creation, roster joining, and bracket score advancement. |
| **Role Security** | ✅ **Server-Validated** | Admin mutations require server-side role headers. |

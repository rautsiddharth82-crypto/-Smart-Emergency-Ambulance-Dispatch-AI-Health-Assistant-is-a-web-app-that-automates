<div align="center">

# 🚑 SwiftRescue
### Smart Emergency Ambulance Dispatch & AI Health Assistant

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Groq](https://img.shields.io/badge/Groq_AI-F05A28?style=for-the-badge&logo=fastapi&logoColor=white)](https://groq.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

<p align="center">
  <b>An automated, real-time emergency healthcare platform that bridges the gap between emergency ambulance dispatch, intelligent symptom triage, doctor appointments, and instant medical consultations.</b>
</p>

🔗 **Live Production App**: **[https://swift-rescue-dispatch.vercel.app](https://swift-rescue-dispatch.vercel.app)**

---

</div>

## 🌟 Key Modules & Features

### 1. 🏠 Landing Page & Role-Based Access
- **Modern Interactive Landing Page (`LandingPage.tsx`)**: Hero banner, live telemetry counters, feature showcase, 3-step workflow, and instant access portal.
- **Role-Based Authentication (`AuthModal.tsx` & `/api/auth/login`)**:
  - **Citizen / Patient (`user`)**: Instant 1-click SOS GPS dispatch, Dr. Dost AI Ayurvedic assistant, doctor directory, appointment scheduling, and lab tests.
  - **Ambulance Driver (`driver`)**: Real-time vehicle GPS sync, incoming patient assignment alerts, and availability toggles (`Available`, `Busy`).
  - **System Administrator (`admin`)**: Nationwide fleet command map, highway toll plaza deployments, appointments audit logs, and dispatch queue.
  - **Medical Doctor (`doctor`)**: Scheduled appointments manager, live teleconsultation queue, and bidirectional real-time chat.

### 2. 📅 Doctor Appointment Booking System
- **Specialist Selection**: Patients can choose from verified physicians, cardiologists, ayurvedic doctors, and neurologists.
- **Time Slot & Date Scheduling**: Real-time slot reservation (Morning, Afternoon, Evening) with immediate booking confirmation ID.
- **Appointment Tracking**: Dedicated "Appointments" tab for citizens and doctor dashboard to view, manage, and complete scheduled consultations.

### 3. 🚨 Automated Real-Time Ambulance Dispatch
- **1-Click SOS Trigger**: Automatically pinpoints patient GPS location and dispatches the nearest available emergency unit using the Haversine distance algorithm.
- **Live Interactive Maps**: Real-time Leaflet map tracking of ambulances, patient coordinates, route paths, and dynamic status updates.
- **Toll Plaza Integration**: Automated deployment of emergency ambulance units across highway toll plazas via OpenStreetMap Overpass API.

### 4. 🤖 Dr. Dost — AI Health & Ayurvedic Assistant
- **Dual AI Engine**: Powered by ultra-fast **Groq** (`llama-3.3-70b-versatile`, `openai/gpt-oss-120b`) and **Google Gemini** (`gemini-2.5-flash`).
- **Offline/Zero-Error Fallback**: Embedded intelligent Ayurvedic triage engine ensures 100% uninterrupted guidance even with network dropouts.
- **Multilingual Support**: Auto-detects input language and responds seamlessly in English, Hindi, Hinglish, Marathi, Bengali, Tamil, Telugu, and more.
- **Voice Interaction & Speech Synthesis**: Integrated voice recognition and speech output for hands-free emergency access.

### 5. 📱 Mobile Friendly & Progressive Web App (PWA)
- Touch-optimized 5-tab bottom navigation bar (`Home`, `Emergency`, `Doctors`, `Ambulance`, `Command`).
- PWA manifest (`public/manifest.json`) supporting standalone "Install App" mode on Android and iOS.

---

## 🔐 Default Demo Accounts

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Citizen / Patient** | `patient@swiftrescue.org` | `patient123` | SOS Dispatch, Dr. Dost AI, Appointments, Labs |
| **Ambulance Driver** | `driver@swiftrescue.org` | `driver123` | Unit Telemetry, Status Toggle |
| **System Admin** | `admin@swiftrescue.org` | `admin123` | Full Command Center, Toll Units, Audit Logs |
| **Medical Doctor** | `doctor@swiftrescue.org` | `doctor123` | Booked Appointments & Live Consultations |

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Lucide Icons |
| **Mapping & GIS** | Leaflet, React-Leaflet, OpenStreetMap, Nominatim Geocoding, Overpass API |
| **Backend** | Node.js, Express.js, TypeScript (`tsx`), Socket.io, Better-SQLite3 |
| **Database** | SQLite (`rescue.db`) with tables: `users`, `ambulances`, `requests`, `doctors`, `consultations`, `live_messages`, `appointments` |
| **AI & LLM** | Groq SDK (`llama-3.3-70b-versatile`, `openai/gpt-oss-120b`), Google GenAI SDK (`gemini-2.5-flash`), Web Speech API |

---

## 📡 REST API & Socket.io Endpoints

### Authentication
- `POST /api/auth/login`: Authenticate user by email & password with role verification.
- `POST /api/auth/register`: Create a new user account.
- `GET /api/auth/users`: List all registered platform accounts.

### Doctor Appointments
- `POST /api/appointments`: Schedule a new doctor appointment.
- `GET /api/appointments`: List all booked appointments.
- `GET /api/appointments/doctor/:doctorId`: Fetch appointments for a specific doctor.
- `GET /api/appointments/user/:patientId`: Fetch appointments for a specific patient.
- `PATCH /api/appointments/:id/status`: Update appointment status (`confirmed`, `completed`, `cancelled`).

### Dispatch & Fleet Management
- `GET /api/ambulances`: List all ambulance fleet units.
- `POST /api/ambulances`: Register a new ambulance unit with pincode geocoding.
- `POST /api/ambulances/toll-plazas`: Query OpenStreetMap Overpass API to deploy units at highway toll plazas.
- `GET /api/requests`: Retrieve emergency dispatch audit logs.
- `GET /api/geocode`: OpenStreetMap Nominatim pincode and address geocoder.

### AI Engine
- `POST /api/groq/chat`: Server-side Groq LLM inference with multi-model fallback.

### Socket.io Events
- `request_ambulance`: Emitted by patient to trigger nearest unit matching via Haversine formula.
- `update_ambulance`: Emitted by driver to broadcast live GPS telemetry and status.
- `consultation_requested` & `accept_consultation`: Real-time doctor-patient matching.
- `send_live_message`: Bidirectional encrypted chat between doctor and patient.
- `new_appointment`: Broadcasts instant appointment booking alerts.

---

## 🚀 Local Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- `npm` or `yarn`

### 1. Clone the Repository
```bash
git clone https://github.com/rautsiddharth82-crypto/-Smart-Emergency-Ambulance-Dispatch-AI-Health-Assistant-is-a-web-app-that-automates.git
cd -Smart-Emergency-Ambulance-Dispatch-AI-Health-Assistant-is-a-web-app-that-automates
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:

```env
GROQ_API_KEY="gsk_your_groq_api_key"
GEMINI_API_KEY="AIza_your_gemini_api_key"
APP_URL="http://localhost:3000"
PORT=3000
```

### 4. Start the Application
```bash
npm run dev
```

Visit **`http://localhost:3000`** in your browser to access the complete platform!

---

## 🧪 Testing & Build Verification

```bash
# Type check & Lint
npm run lint

# Production bundle build
npm run build
```

---

<div align="center">
  <b>SwiftRescue Platform</b> • Built with ❤️ for rapid emergency response and accessible healthcare
</div>

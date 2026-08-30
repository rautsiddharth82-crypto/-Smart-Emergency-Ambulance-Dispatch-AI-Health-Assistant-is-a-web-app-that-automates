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
  <b>An automated, real-time emergency healthcare platform that bridges the gap between emergency ambulance dispatch, intelligent symptom triage, and instant medical consultations.</b>
</p>

🔗 **Live Production App**: **[https://swift-rescue-dispatch.vercel.app](https://swift-rescue-dispatch.vercel.app)**

---

</div>

## 🌟 Key Modules & Features

### 1. 🏠 Landing Page & Role-Based Access
- **Modern Interactive Landing Page (`LandingPage.tsx`)**: Hero banner, live telemetry counters, feature showcase, 3-step workflow, and instant access portal.
- **Role-Based Authentication**:
  - **Citizen / Patient (`user`)**: Instant 1-click SOS GPS dispatch, Dr. Dost AI Ayurvedic health assistant, physician directory, and diagnostic lab booking.
  - **Ambulance Driver (`driver`)**: Real-time vehicle GPS sync, incoming patient assignment alerts, and availability toggles (`Available`, `Busy`, `Offline`).
  - **System Administrator (`admin`)**: Nationwide fleet command map, Overpass API highway toll plaza deployment, and dispatch request queue.
  - **Medical Doctor (`doctor`)**: Live patient teleconsultation queue and bidirectional live chat.

### 2. 🚨 Automated Real-Time Ambulance Dispatch
- **1-Click SOS Trigger**: Automatically pinpoints patient GPS location and dispatches the nearest available emergency unit using the Haversine distance algorithm.
- **Live Interactive Maps**: Real-time Leaflet map tracking of ambulances, patient coordinates, route paths, and dynamic status updates.
- **Toll Plaza Integration**: Automated deployment of emergency ambulance units across highway toll plazas via OpenStreetMap Overpass API.

### 3. 🤖 Dr. Dost — AI Health & Ayurvedic Assistant
- **Dual AI Engine**: Powered by ultra-fast **Groq** (`llama-3.3-70b-versatile`, `openai/gpt-oss-120b`) and **Google Gemini** (`gemini-2.5-flash`).
- **Multilingual Support**: Auto-detects input language and responds seamlessly in English, Hindi, Hinglish, Marathi, Bengali, Tamil, Telugu, and more.
- **Symptom & Visual Diagnosis**: Analyzes symptom descriptions and uploaded medical condition images with compassionate wellness guidance and Ayurvedic Dosha balance principles.
- **Voice Interaction & TTS**: Integrated voice input and speech synthesis for accessibility during emergencies.

### 4. 👨‍⚕️ Telehealth & Live Doctor Consultations
- Real-time directory of verified physicians and Ayurvedic specialists.
- Direct doctor-patient consultation requests with live bidirectional chat powered by Socket.io.

### 5. 📱 Mobile Friendly & Progressive Web App (PWA)
- Touch-optimized bottom navigation bar for one-thumb switching between portals.
- PWA manifest (`public/manifest.json`) supporting standalone "Install App" mode on Android and iOS.

---

## 🔐 Default Demo Accounts

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Citizen / Patient** | `patient@swiftrescue.org` | `patient123` | SOS Dispatch, Dr. Dost AI, Doctors, Labs |
| **Ambulance Driver** | `driver@swiftrescue.org` | `driver123` | Unit Telemetry, Status Toggle |
| **System Admin** | `admin@swiftrescue.org` | `admin123` | Full Command Center & Fleet Grid |
| **Medical Doctor** | `doctor@swiftrescue.org` | `doctor123` | Teleconsultation Queue & Live Chat |

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Lucide Icons |
| **Mapping & GIS** | Leaflet, React-Leaflet, OpenStreetMap, Nominatim Geocoding, Overpass API |
| **Backend** | Node.js, Express.js, TypeScript (`tsx`), Socket.io, Better-SQLite3 |
| **Database** | SQLite (`rescue.db`) with tables: `users`, `ambulances`, `requests`, `doctors`, `consultations`, `live_messages` |
| **AI & LLM** | Groq SDK (`llama-3.3-70b-versatile`, `openai/gpt-oss-120b`), Google GenAI SDK (`gemini-2.5-flash`), Web Speech API |

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
Copy `env.example` to `.env` or `.env.local`:

```env
# Groq API Key (High-Speed LLM Inference)
GROQ_API_KEY="your_groq_api_key_here"

# Google Gemini API Key
GEMINI_API_KEY="your_gemini_api_key_here"

# Application URL
APP_URL="http://localhost:3000"
```

### 4. Start the Application
```bash
# Start full-stack dev server (Express Backend + Vite Frontend)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 REST API & Socket.io Reference

### REST Endpoints
- `POST /api/auth/login` — User authentication.
- `POST /api/auth/register` — Create user account with role (`user`, `driver`, `admin`, `doctor`).
- `POST /api/groq/chat` — AI Chat completion with Groq LLM.
- `GET /api/ambulances` — Fetch all active fleet units.
- `POST /api/ambulances/toll-plazas` — Deploy ambulance units at highway toll plazas via Overpass API.
- `GET /api/requests` — Fetch dispatch requests.
- `GET /api/doctors` — Fetch verified doctor directory.
- `GET /api/consultations/pending` — Fetch awaiting patient teleconsultations.
- `GET /api/consultations/:id/messages` — Fetch chat history for consultation.

### Socket.io Events
- `request_ambulance` — Broadcast emergency patient coordinates to fleet dispatch.
- `update_ambulance` — Real-time telemetry broadcast from ambulance driver units.
- `request_consultation` — Patient requests live doctor telehealth session.
- `accept_consultation` — Doctor accepts consultation.
- `send_live_message` — Real-time message exchange between doctor and patient.

---

## 📄 License
MIT License. Developed for automated emergency healthcare response and smart dispatching.

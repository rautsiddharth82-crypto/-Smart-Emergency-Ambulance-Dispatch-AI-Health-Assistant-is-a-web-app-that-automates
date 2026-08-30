<div align="center">

# 🚑 SwiftRescue
### Smart Emergency Ambulance Dispatch & AI Health Assistant

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Groq](https://img.shields.io/badge/Groq_AI-F05A28?style=for-the-badge&logo=fastapi&logoColor=white)](https://groq.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

<p align="center">
  <b>An automated, real-time emergency healthcare platform that bridges the gap between emergency ambulance dispatch, intelligent symptom triage, and instant medical consultations.</b>
</p>

---

</div>

## 🌟 Key Features

### 1. 🚨 Automated Real-Time Ambulance Dispatch
- **1-Click SOS Trigger**: Automatically pinpoints patient GPS location and dispatches the nearest available emergency unit using the Haversine distance algorithm.
- **Live Interactive Maps**: Real-time Leaflet map tracking of ambulances, patient coordinates, route paths, and dynamic status updates (`available`, `busy`, `offline`).
- **Toll Plaza Integration**: Automated deployment of emergency ambulance units across highway toll plazas via OpenStreetMap Overpass API.

### 2. 🤖 Dr. Dost — AI Health & Ayurvedic Assistant
- **Dual AI Engine**: Powered by ultra-fast **Groq** (`openai/gpt-oss-120b`, `llama-3.3-70b-versatile`) and **Google Gemini** (`gemini-2.5-flash`).
- **Multilingual Support**: Auto-detects input language and responds seamlessly in English, Hindi, Hinglish, Marathi, Bengali, Tamil, Telugu, and more.
- **Symptom & Visual Diagnosis**: Analyzes symptom descriptions and uploaded medical condition images with compassionate wellness guidance and Ayurvedic Dosha balance principles.
- **Voice Interaction & TTS**: Integrated voice input and speech synthesis for accessibility during emergencies.
- **Emergency Escalation**: Automatically detects life-threatening symptoms and directs users to trigger immediate SOS dispatch.

### 3. 👨‍⚕️ Telehealth & Live Doctor Consultations
- Real-time directory of verified physicians and Ayurvedic specialists.
- Direct doctor-patient consultation requests with live bidirectional chat powered by Socket.io.

### 4. 🎛️ Command Center & Fleet Management
- **Admin Dispatch Console**: Comprehensive dashboard to monitor all incoming emergency requests, manage fleet deployments, and track response metrics.
- **Driver / Paramedic Interface**: Real-time status toggling, incoming dispatch alerts, and navigation routes.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Motion (Framer Motion), Lucide Icons |
| **Mapping & GIS** | Leaflet, React-Leaflet, OpenStreetMap, Nominatim Geocoding, Overpass API |
| **Backend** | Node.js, Express.js, TypeScript (`tsx`), Socket.io, Better-SQLite3 |
| **AI & LLM** | Groq SDK (`openai/gpt-oss-120b`), Google GenAI SDK (`gemini-2.5-flash`), Web Speech API |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
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
Create a `.env` or `.env.local` file in the root directory:

```env
# Groq API Key (High-Speed LLM Inference)
GROQ_API_KEY="your_groq_api_key_here"

# Google Gemini API Key (Optional)
GEMINI_API_KEY="your_gemini_api_key_here"

# App Port / URL
APP_URL="http://localhost:3000"
```

### 4. Start Development Server
```bash
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔌 API Reference

### AI Services
- `POST /api/groq/chat` — Direct backend chat completion endpoint using Groq SDK.
  ```json
  {
    "prompt": "What are natural remedies for a migraine?",
    "model": "openai/gpt-oss-120b"
  }
  ```

### Ambulance & Dispatch
- `GET /api/ambulances` — Fetch all ambulances with live coordinates and statuses.
- `POST /api/ambulances` — Register or deploy a new ambulance unit by pincode.
- `POST /api/ambulances/toll-plazas` — Scan and deploy ambulance units around highway toll booths.
- `GET /api/requests` — List active and historical emergency dispatch requests.

### Consultations & Doctors
- `GET /api/doctors` — List available verified physicians.
- `GET /api/consultations/pending` — List pending patient consultation requests.
- `GET /api/consultations/:id/messages` — Fetch live chat logs for a specific consultation.

---

## 📁 Project Structure

```
├── lib/
│   └── utils.ts            # Utility functions (cn, clsx, tailwind-merge)
├── App.tsx                 # Main application component & interactive views
├── main.tsx                # React DOM entry point
├── server.ts               # Express backend, SQLite schema, Socket.io, & Groq API
├── index.css               # Global Tailwind CSS and Leaflet styles
├── index.html              # HTML5 template
├── vite.config.ts          # Vite configuration & environment variable bridges
├── package.json            # Dependencies and npm scripts
└── README.md               # Project documentation
```

---

## 🛡️ License

This project is licensed under the [MIT License](LICENSE).

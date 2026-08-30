import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import Database from "better-sqlite3";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();
dotenv.config({ path: ".env.local" });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const db = new Database("rescue.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS ambulances (
    id TEXT PRIMARY KEY,
    name TEXT,
    lat REAL,
    lng REAL,
    status TEXT DEFAULT 'available', -- available, busy, offline
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS requests (
    id TEXT PRIMARY KEY,
    patient_name TEXT,
    patient_lat REAL,
    patient_lng REAL,
    status TEXT DEFAULT 'searching', -- searching, assigned, completed
    ambulance_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(ambulance_id) REFERENCES ambulances(id)
  );

  CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY,
    name TEXT,
    specialization TEXT,
    status TEXT DEFAULT 'online' -- online, busy, offline
  );

  CREATE TABLE IF NOT EXISTS consultations (
    id TEXT PRIMARY KEY,
    patient_id TEXT,
    patient_name TEXT,
    reason TEXT,
    doctor_id TEXT,
    status TEXT DEFAULT 'pending', -- pending, active, completed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS live_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    consultation_id TEXT,
    sender_id TEXT,
    text TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user', -- 'user', 'driver', 'admin', 'doctor'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    patient_id TEXT,
    patient_name TEXT,
    patient_phone TEXT,
    doctor_id TEXT,
    doctor_name TEXT,
    date TEXT,
    time_slot TEXT,
    reason TEXT,
    status TEXT DEFAULT 'confirmed', -- 'confirmed', 'completed', 'cancelled'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration for existing tables
try {
  db.prepare("ALTER TABLE consultations ADD COLUMN patient_name TEXT").run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE consultations ADD COLUMN reason TEXT").run();
} catch (e) {}

// Seed initial users if empty
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  const insertUser = db.prepare("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)");
  insertUser.run("USR-001", "Rahul Sharma (Citizen)", "patient@swiftrescue.org", "patient123", "user");
  insertUser.run("USR-002", "Amit Singh (Unit 001 Driver)", "driver@swiftrescue.org", "driver123", "driver");
  insertUser.run("USR-003", "Dispatch Commander (HQ)", "admin@swiftrescue.org", "admin123", "admin");
  insertUser.run("USR-004", "Dr. Rajesh Kumar (MD)", "doctor@swiftrescue.org", "doctor123", "doctor");
}

// Seed initial ambulances if empty
const count = db.prepare("SELECT COUNT(*) as count FROM ambulances").get() as { count: number };
if (count.count < 10) {
  const insert = db.prepare("INSERT OR IGNORE INTO ambulances (id, name, lat, lng, status) VALUES (?, ?, ?, ?, ?)");
  
  // Base location (Bangalore)
  const baseLat = 12.9716;
  const baseLng = 77.5946;

  for (let i = 1; i <= 100; i++) {
    const id = `AMB-${String(i).padStart(3, '0')}`;
    const name = `Swift Unit ${i}`;
    // Randomize within ~10km
    const lat = baseLat + (Math.random() - 0.5) * 0.1;
    const lng = baseLng + (Math.random() - 0.5) * 0.1;
    insert.run(id, name, lat, lng, "available");
  }
}

// Seed initial doctors if empty
const doctorCount = db.prepare("SELECT COUNT(*) as count FROM doctors").get() as { count: number };
if (doctorCount.count === 0) {
  const insert = db.prepare("INSERT INTO doctors (id, name, specialization) VALUES (?, ?, ?)");
  insert.run("DR-001", "Dr. Sharma", "Ayurvedic Specialist");
  insert.run("DR-002", "Dr. Patel", "General Physician");
  insert.run("DR-003", "Dr. Iyer", "Panchakarma Expert");
}

app.use(express.json());

// Helper: Haversine distance
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Socket.io Logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Ambulance updates its location/status
  socket.on("update_ambulance", (data) => {
    const { id, lat, lng, status } = data;
    db.prepare("UPDATE ambulances SET lat = ?, lng = ?, status = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?")
      .run(lat, lng, status, id);
    io.emit("ambulance_updated", { id, lat, lng, status });
  });

  // Patient requests ambulance
  socket.on("request_ambulance", (data) => {
    const { patient_name, lat, lng } = data;
    const requestId = `REQ-${Date.now()}`;
    
    // Find nearest available ambulance
    const availableAmbulances = db.prepare("SELECT * FROM ambulances WHERE status = 'available'").all() as any[];
    
    let nearestAmbulance = null;
    let minDistance = Infinity;

    availableAmbulances.forEach(amb => {
      const dist = getDistance(lat, lng, amb.lat, amb.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearestAmbulance = amb;
      }
    });

    if (nearestAmbulance) {
      // Assign ambulance
      db.prepare("INSERT INTO requests (id, patient_name, patient_lat, patient_lng, status, ambulance_id) VALUES (?, ?, ?, ?, ?, ?)")
        .run(requestId, patient_name, lat, lng, "assigned", (nearestAmbulance as any).id);
      
      db.prepare("UPDATE ambulances SET status = 'busy' WHERE id = ?")
        .run((nearestAmbulance as any).id);

      io.emit("request_assigned", {
        requestId,
        ambulance: nearestAmbulance,
        patient: { lat, lng, name: patient_name }
      });
      
      // Notify the specific ambulance if we had room IDs, but for prototype we broadcast
      io.emit("ambulance_updated", { id: (nearestAmbulance as any).id, status: 'busy' });
    } else {
      db.prepare("INSERT INTO requests (id, patient_name, patient_lat, patient_lng, status) VALUES (?, ?, ?, ?, ?)")
        .run(requestId, patient_name, lat, lng, "searching");
      io.emit("request_queued", { requestId, patient_name, lat, lng });
    }
  });

  // Live Consultation Logic
  socket.on("request_consultation", (data) => {
    const { patient_id, patient_name, reason } = data;
    const consultationId = `CONS-${Date.now()}`;
    
    db.prepare("INSERT INTO consultations (id, patient_id, patient_name, reason, status) VALUES (?, ?, ?, ?, ?)")
      .run(consultationId, patient_id, patient_name, reason, "pending");
    
    // Notify all doctors
    io.emit("consultation_requested", { consultationId, patient_id, patient_name, reason });
  });

  socket.on("accept_consultation", (data) => {
    const { consultationId, doctor_id } = data;
    
    db.prepare("UPDATE consultations SET doctor_id = ?, status = 'active' WHERE id = ?")
      .run(doctor_id, consultationId);
    
    const doctor = db.prepare("SELECT * FROM doctors WHERE id = ?").get(doctor_id) as any;
    
    io.emit("consultation_started", { consultationId, doctor });
  });

  socket.on("send_live_message", (data) => {
    const { consultationId, sender_id, text } = data;
    
    db.prepare("INSERT INTO live_messages (consultation_id, sender_id, text) VALUES (?, ?, ?)")
      .run(consultationId, sender_id, text);
    
    io.emit("new_live_message", { consultationId, sender_id, text, timestamp: new Date().toISOString() });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// API Routes - Authentication
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = db.prepare("SELECT id, name, email, role, created_at FROM users WHERE email = ? AND password = ?").get(email, password) as any;
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  res.json({ success: true, user });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, password, role = "user" } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  try {
    const id = `USR-${Date.now()}`;
    db.prepare("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)")
      .run(id, name, email, password, role);
    
    res.json({
      success: true,
      user: { id, name, email, role, created_at: new Date().toISOString() }
    });
  } catch (error: any) {
    if (error?.message?.includes("UNIQUE constraint failed")) {
      return res.status(400).json({ error: "An account with this email already exists" });
    }
    res.status(500).json({ error: "Failed to create account" });
  }
});

app.get("/api/auth/users", (req, res) => {
  const users = db.prepare("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC").all();
  res.json(users);
});

// API Routes - Core Dispatch & Medical
app.get("/api/ambulances", (req, res) => {
  const ambulances = db.prepare("SELECT * FROM ambulances").all();
  res.json(ambulances);
});

app.get("/api/requests", (req, res) => {
  const requests = db.prepare("SELECT * FROM requests ORDER BY created_at DESC").all();
  res.json(requests);
});

app.get("/api/doctors", (req, res) => {
  const doctors = db.prepare("SELECT * FROM doctors").all();
  res.json(doctors);
});

app.get("/api/consultations/pending", (req, res) => {
  const pending = db.prepare("SELECT * FROM consultations WHERE status = 'pending' ORDER BY created_at DESC").all();
  res.json(pending);
});

app.get("/api/consultations/:id/messages", (req, res) => {
  const messages = db.prepare("SELECT * FROM live_messages WHERE consultation_id = ? ORDER BY timestamp ASC").all(req.params.id);
  res.json(messages);
});

// API Routes - Appointments
app.post("/api/appointments", (req, res) => {
  const { patient_id, patient_name, patient_phone, doctor_id, doctor_name, date, time_slot, reason } = req.body;
  if (!patient_name || !doctor_id || !date || !time_slot) {
    return res.status(400).json({ error: "Patient name, doctor, date, and time slot are required" });
  }

  const id = `APT-${Date.now()}`;
  db.prepare(`
    INSERT INTO appointments (id, patient_id, patient_name, patient_phone, doctor_id, doctor_name, date, time_slot, reason, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
  `).run(id, patient_id || "GUEST", patient_name, patient_phone || "", doctor_id, doctor_name || "Doctor", date, time_slot, reason || "General Checkup");

  const newAppointment = db.prepare("SELECT * FROM appointments WHERE id = ?").get(id);
  io.emit("new_appointment", newAppointment);
  res.json({ success: true, appointment: newAppointment });
});

app.get("/api/appointments", (req, res) => {
  const appointments = db.prepare("SELECT * FROM appointments ORDER BY created_at DESC").all();
  res.json(appointments);
});

app.get("/api/appointments/doctor/:doctorId", (req, res) => {
  const appointments = db.prepare("SELECT * FROM appointments WHERE doctor_id = ? ORDER BY date ASC, time_slot ASC").all(req.params.doctorId);
  res.json(appointments);
});

app.get("/api/appointments/user/:patientId", (req, res) => {
  const appointments = db.prepare("SELECT * FROM appointments WHERE patient_id = ? ORDER BY created_at DESC").all(req.params.patientId);
  res.json(appointments);
});

app.patch("/api/appointments/:id/status", (req, res) => {
  const { status } = req.body;
  db.prepare("UPDATE appointments SET status = ? WHERE id = ?").run(status, req.params.id);
  const updated = db.prepare("SELECT * FROM appointments WHERE id = ?").get(req.params.id);
  io.emit("appointment_updated", updated);
  res.json({ success: true, appointment: updated });
});

// OpenStreetMap Nominatim Geocoding Endpoint
app.get("/api/geocode", async (req, res) => {
  const { q, pincode } = req.query;
  const queryParam = pincode ? `postalcode=${pincode}` : `q=${encodeURIComponent(String(q || 'Bangalore'))}`;
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${queryParam}&format=json&limit=1`, {
      headers: { 'User-Agent': 'SwiftRescue-Platform' }
    });
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to geocode query", details: err?.message });
  }
});

// Groq Chat AI Endpoint
app.post("/api/groq/chat", async (req, res) => {
  try {
    const { prompt, messages, model } = req.body;
    const chatMessages = messages || [{ role: "user", content: prompt }];
    const selectedModel = model || "openai/gpt-oss-120b";

    const completion = await groq.chat.completions.create({
      messages: chatMessages,
      model: selectedModel,
    });
    res.json({ success: true, response: completion.choices[0]?.message?.content });
  } catch (error: any) {
    console.error("Groq Backend Error:", error);
    try {
      // Fallback model if requested model has quota/access issues
      const fallbackCompletion = await groq.chat.completions.create({
        messages: req.body.messages || [{ role: "user", content: req.body.prompt }],
        model: "openai/gpt-oss-20b",
      });
      res.json({ success: true, response: fallbackCompletion.choices[0]?.message?.content });
    } catch (fallbackError: any) {
      res.status(500).json({ error: "Failed to fetch response from Groq", details: error?.message });
    }
  }
});

// Helper: Geocode pincode (Mocking for prototype, but using a real structure)
async function geocodePincode(pincode: string) {
  try {
    // In a real app, we'd use Nominatim or Google Maps API
    // For this prototype, we'll use a simple mock mapping or a fetch to a free service
    const response = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${pincode}&format=json&limit=1`, {
      headers: { 'User-Agent': 'SwiftRescue-Prototype' }
    });
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    // Fallback if geocoding fails (randomish location for demo)
    return { lat: 12.97 + Math.random() * 0.1, lng: 77.59 + Math.random() * 0.1 };
  } catch (error) {
    console.error("Geocoding error:", error);
    return { lat: 12.97, lng: 77.59 };
  }
}

// Helper: Fetch toll plazas using Overpass API
async function fetchTollPlazas(lat: number, lng: number, radius: number = 50000) {
  try {
    const query = `[out:json];node["barrier"="toll_booth"](around:${radius},${lat},${lng});out;`;
    const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data.elements || [];
  } catch (error) {
    console.error("Overpass API error:", error);
    return [];
  }
}

app.post("/api/ambulances/toll-plazas", async (req, res) => {
  const { lat, lng, radius } = req.body;
  try {
    const plazas = await fetchTollPlazas(lat || 12.9716, lng || 77.5946, radius || 50000);
    const deployed = [];
    
    const insert = db.prepare("INSERT OR IGNORE INTO ambulances (id, name, lat, lng, status) VALUES (?, ?, ?, ?, ?)");
    
    for (const plaza of plazas) {
      const id = `TOLL-${plaza.id}`;
      const name = `Toll Unit ${plaza.id}`;
      insert.run(id, name, plaza.lat, plaza.lon, 'available');
      deployed.push({ id, name, lat: plaza.lat, lng: plaza.lon });
    }
    
    io.emit("ambulance_updated", { status: 'refresh' }); // Signal clients to refresh
    res.json({ success: true, count: deployed.length, deployed });
  } catch (error) {
    res.status(500).json({ error: "Failed to deploy toll plaza units" });
  }
});

app.post("/api/ambulances", async (req, res) => {
  const { id, name, pincode } = req.body;
  try {
    const coords = await geocodePincode(pincode);
    db.prepare("INSERT INTO ambulances (id, name, lat, lng, status) VALUES (?, ?, ?, ?, ?)")
      .run(id, name, coords.lat, coords.lng, 'available');
    io.emit("ambulance_updated", { id, name, lat: coords.lat, lng: coords.lng, status: 'available' });
    res.json({ success: true, coords });
  } catch (error) {
    res.status(400).json({ error: "Ambulance ID already exists or invalid data" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  const PORT = 3000;
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

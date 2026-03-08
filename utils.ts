import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  Activity, 
  MapPin, 
  Navigation, 
  AlertCircle, 
  Shield, 
  Truck, 
  User, 
  Settings,
  CheckCircle2,
  Clock,
  ChevronRight,
  Plus,
  X,
  Map as MapIcon,
  Bell,
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  Mic,
  MicOff,
  ImageIcon,
  Paperclip,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Target,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { GoogleGenAI, Modality } from "@google/genai";

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Fix Leaflet marker icons
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const DUMMY_DOCTORS = [
  {
    id: 'DOC-1',
    name: 'Dr. Rajesh Kumar',
    domain: 'General Physician',
    fees: '₹500',
    rating: 4.8,
    schedule: 'Mon-Sat, 10 AM - 5 PM',
    image: 'https://picsum.photos/seed/doc1/200/200',
    status: 'online'
  },
  {
    id: 'DOC-2',
    name: 'Dr. Anjali Sharma',
    domain: 'Ayurvedic Specialist',
    fees: '₹700',
    rating: 4.9,
    schedule: 'Tue-Sun, 11 AM - 6 PM',
    image: 'https://picsum.photos/seed/doc2/200/200',
    status: 'online'
  },
  {
    id: 'DOC-3',
    name: 'Dr. Vikram Singh',
    domain: 'Cardiologist',
    fees: '₹1200',
    rating: 4.7,
    schedule: 'Mon-Fri, 9 AM - 2 PM',
    image: 'https://picsum.photos/seed/doc3/200/200',
    status: 'offline'
  },
  {
    id: 'DOC-4',
    name: 'Dr. Priya Das',
    domain: 'Pediatrician',
    fees: '₹600',
    rating: 4.8,
    schedule: 'Mon-Sat, 9 AM - 4 PM',
    image: 'https://picsum.photos/seed/doc4/200/200',
    status: 'online'
  },
  {
    id: 'DOC-5',
    name: 'Dr. Amit Verma',
    domain: 'Dermatologist',
    fees: '₹800',
    rating: 4.6,
    schedule: 'Mon-Fri, 11 AM - 7 PM',
    image: 'https://picsum.photos/seed/doc5/200/200',
    status: 'online'
  },
  {
    id: 'DOC-6',
    name: 'Dr. Sneha Reddy',
    domain: 'Gynecologist',
    fees: '₹900',
    rating: 4.9,
    schedule: 'Mon-Sat, 10 AM - 3 PM',
    image: 'https://picsum.photos/seed/doc6/200/200',
    status: 'offline'
  },
  {
    id: 'DOC-7',
    name: 'Dr. Rahul Mehta',
    domain: 'Orthopedic',
    fees: '₹1000',
    rating: 4.7,
    schedule: 'Tue-Sat, 12 PM - 6 PM',
    image: 'https://picsum.photos/seed/doc7/200/200',
    status: 'online'
  },
  {
    id: 'DOC-8',
    name: 'Dr. Kavita Iyer',
    domain: 'Neurologist',
    fees: '₹1500',
    rating: 4.8,
    schedule: 'Mon-Fri, 10 AM - 2 PM',
    image: 'https://picsum.photos/seed/doc8/200/200',
    status: 'online'
  },
  {
    id: 'DOC-9',
    name: 'Dr. Manoj Gupta',
    domain: 'Dentist',
    fees: '₹400',
    rating: 4.5,
    schedule: 'Mon-Sat, 9 AM - 1 PM',
    image: 'https://picsum.photos/seed/doc9/200/200',
    status: 'offline'
  },
  {
    id: 'DOC-10',
    name: 'Dr. Sunita Rao',
    domain: 'Psychiatrist',
    fees: '₹1100',
    rating: 4.9,
    schedule: 'Mon-Fri, 3 PM - 8 PM',
    image: 'https://picsum.photos/seed/doc10/200/200',
    status: 'online'
  },
  {
    id: 'DOC-11',
    name: 'Dr. Arjun Kapoor',
    domain: 'ENT Specialist',
    fees: '₹650',
    rating: 4.7,
    schedule: 'Mon-Sat, 4 PM - 9 PM',
    image: 'https://picsum.photos/seed/doc11/200/200',
    status: 'online'
  }
];

const DUMMY_LABS = [
  {
    id: 'LAB-1',
    name: 'City Diagnostics Center',
    location: 'Downtown',
    rating: 4.7,
    image: 'https://picsum.photos/seed/lab1/200/200',
    services: [
      { name: 'Blood Test', cost: '₹300' },
      { name: 'X-Ray', cost: '₹800' },
      { name: 'MRI Scan', cost: '₹5000' }
    ]
  },
  {
    id: 'LAB-2',
    name: 'Apollo PathLabs',
    location: 'West Wing',
    rating: 4.9,
    image: 'https://picsum.photos/seed/lab2/200/200',
    services: [
      { name: 'Full Body Checkup', cost: '₹2500' },
      { name: 'COVID-19 RT-PCR', cost: '₹1200' },
      { name: 'Thyroid Profile', cost: '₹600' }
    ]
  },
  {
    id: 'LAB-3',
    name: 'Metropolis Healthcare',
    location: 'North Station',
    rating: 4.6,
    image: 'https://picsum.photos/seed/lab3/200/200',
    services: [
      { name: 'Lipid Profile', cost: '₹900' },
      { name: 'Diabetes Screen', cost: '₹450' },
      { name: 'Vitamin D Test', cost: '₹1500' }
    ]
  },
  {
    id: 'LAB-4',
    name: 'Dr. Lal PathLabs',
    location: 'East Side',
    rating: 4.8,
    image: 'https://picsum.photos/seed/lab4/200/200',
    services: [
      { name: 'CBC Test', cost: '₹350' },
      { name: 'Liver Function Test', cost: '₹1100' },
      { name: 'Kidney Function Test', cost: '₹1000' }
    ]
  },
  {
    id: 'LAB-5',
    name: 'SRL Diagnostics',
    location: 'Central Plaza',
    rating: 4.5,
    image: 'https://picsum.photos/seed/lab5/200/200',
    services: [
      { name: 'Urine Analysis', cost: '₹200' },
      { name: 'ECG', cost: '₹500' },
      { name: 'Ultrasound', cost: '₹1800' }
    ]
  },
  {
    id: 'LAB-6',
    name: 'Thyrocare Technologies',
    location: 'South Park',
    rating: 4.7,
    image: 'https://picsum.photos/seed/lab6/200/200',
    services: [
      { name: 'Iron Profile', cost: '₹800' },
      { name: 'HBA1C', cost: '₹550' },
      { name: 'Allergy Panel', cost: '₹3500' }
    ]
  },
  {
    id: 'LAB-7',
    name: 'Quest Diagnostics',
    location: 'Tech Park',
    rating: 4.4,
    image: 'https://picsum.photos/seed/lab7/200/200',
    services: [
      { name: 'DNA Testing', cost: '₹8000' },
      { name: 'Biopsy', cost: '₹4500' },
      { name: 'Hormone Assay', cost: '₹2200' }
    ]
  },
  {
    id: 'LAB-8',
    name: 'Max Labs',
    location: 'Green Valley',
    rating: 4.9,
    image: 'https://picsum.photos/seed/lab8/200/200',
    services: [
      { name: 'Bone Density Scan', cost: '₹3000' },
      { name: 'CT Scan', cost: '₹4000' },
      { name: 'PFT Test', cost: '₹1200' }
    ]
  },
  {
    id: 'LAB-9',
    name: 'Suburban Diagnostics',
    location: 'Harbor View',
    rating: 4.6,
    image: 'https://picsum.photos/seed/lab9/200/200',
    services: [
      { name: 'Stress Test (TMT)', cost: '₹2500' },
      { name: 'Echo Cardiogram', cost: '₹2800' },
      { name: 'Audiometry', cost: '₹600' }
    ]
  },
  {
    id: 'LAB-10',
    name: 'Medall Healthcare',
    location: 'Old Town',
    rating: 4.5,
    image: 'https://picsum.photos/seed/lab10/200/200',
    services: [
      { name: 'Electrolyte Panel', cost: '₹750' },
      { name: 'Stool Test', cost: '₹250' },
      { name: 'Pap Smear', cost: '₹1500' }
    ]
  },
  {
    id: 'LAB-11',
    name: 'Vijaya Diagnostics',
    location: 'Metro Heights',
    rating: 4.8,
    image: 'https://picsum.photos/seed/lab11/200/200',
    services: [
      { name: 'Mammography', cost: '₹2200' },
      { name: 'EEG', cost: '₹1800' },
      { name: 'Urea/Creatinine', cost: '₹400' }
    ]
  }
];

// Custom icons for Map
const ambulanceIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1048/1048313.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
});

const patientIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2830/2830305.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
});

// --- Types ---
type View = 'patient' | 'ambulance' | 'admin' | 'doctor';
type Status = 'available' | 'busy' | 'offline' | 'searching' | 'assigned';

interface Ambulance {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: Status;
}

interface EmergencyRequest {
  id: string;
  patient_name: string;
  patient_lat: number;
  patient_lng: number;
  status: Status;
  ambulance_id?: string;
  created_at: string;
}

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  links?: { title: string, url: string }[];
}

const INDIAN_LANGUAGES = [
  { name: 'Auto Detect', code: 'auto' },
  { name: 'Hindi', code: 'hi-IN' },
  { name: 'English', code: 'en-US' },
  { name: 'Hinglish', code: 'hi-IN' },
  { name: 'Marathi', code: 'mr-IN' },
  { name: 'Gujrati', code: 'gu-IN' },
  { name: 'Tamil', code: 'ta-IN' },
  { name: 'Bhojpuri', code: 'hi-IN' },
  { name: 'Telgu', code: 'te-IN' },
  { name: 'Bangala', code: 'bn-IN' },
  { name: 'Kanad', code: 'kn-IN' },
];

// --- Components ---

const DoctorAnimation = ({ isSpeaking }: { isSpeaking: boolean }) => {
  return (
    <div className="relative w-32 h-32 mx-auto mb-2">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Body/Coat */}
        <path d="M40,180 Q100,140 160,180 L160,200 L40,200 Z" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
        <path d="M70,155 L100,180 L130,155" fill="none" stroke="#cbd5e1" strokeWidth="2" />
        
        {/* Head */}
        <circle cx="100" cy="80" r="50" fill="#fee2e2" stroke="#fecaca" strokeWidth="2" />
        
        {/* Stethoscope */}
        <path d="M70,120 Q100,150 130,120" fill="none" stroke="#475569" strokeWidth="3" />
        <circle cx="100" cy="145" r="8" fill="#94a3b8" />
        
        {/* Eyes */}
        <circle cx="80" cy="75" r="4" fill="#1e293b" />
        <circle cx="120" cy="75" r="4" fill="#1e293b" />
        
        {/* Mouth */}
        <motion.path
          d={isSpeaking ? "M85,100 Q100,120 115,100" : "M85,105 Q100,110 115,105"}
          fill="none"
          stroke="#ef4444"
          strokeWidth="2"
          animate={isSpeaking ? {
            d: ["M85,105 Q100,110 115,105", "M85,100 Q100,125 115,100", "M85,105 Q100,110 115,105"],
          } : {}}
          transition={{ repeat: Infinity, duration: 0.3 }}
        />
        
        {/* Glasses */}
        <path d="M65,75 L95,75 M105,75 L135,75" stroke="#475569" strokeWidth="1" />
        <circle cx="80" cy="75" r="12" fill="none" stroke="#475569" strokeWidth="1" />
        <circle cx="120" cy="75" r="12" fill="none" stroke="#475569" strokeWidth="1" />

        {/* Hands */}
        <motion.g
          animate={isSpeaking ? {
            rotate: [0, -10, 0, 10, 0],
            y: [0, -5, 0]
          } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ originX: "50px", originY: "160px" }}
        >
          <circle cx="50" cy="160" r="12" fill="#fee2e2" stroke="#fecaca" strokeWidth="1" />
        </motion.g>
        <motion.g
          animate={isSpeaking ? {
            rotate: [0, 10, 0, -10, 0],
            y: [0, -5, 0]
          } : {}}
          transition={{ repeat: Infinity, duration: 2.5 }}
          style={{ originX: "150px", originY: "160px" }}
        >
          <circle cx="150" cy="160" r="12" fill="#fee2e2" stroke="#fecaca" strokeWidth="1" />
        </motion.g>
      </svg>
    </div>
  );
};

const Header = ({ currentView, setView }: { currentView: View, setView: (v: View) => void }) => (
  <header className="fixed top-0 left-0 right-0 z-[1000] glass border-b border-white/20 neo-shadow">
    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <div className="flex items-center gap-3 group cursor-pointer">
        <div className="bg-gradient-to-br from-red-500 to-red-700 p-2 rounded-xl shadow-lg shadow-red-200 group-hover:scale-110 transition-transform">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-zinc-900 tracking-tight text-lg leading-none">SwiftRescue</span>
          <span className="text-[10px] font-bold text-red-600 uppercase tracking-[0.2em] mt-1">Protocol v1.1</span>
        </div>
      </div>
      <nav className="hidden md:flex bg-zinc-100/50 backdrop-blur-sm p-1.5 rounded-2xl border border-zinc-200/50">
        {(['patient', 'ambulance', 'admin', 'doctor'] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-bold transition-all capitalize tracking-wide",
              currentView === v 
                ? "bg-white text-zinc-900 shadow-md ring-1 ring-zinc-200/50" 
                : "text-zinc-500 hover:text-zinc-900 hover:bg-white/50"
            )}
          >
            {v}
          </button>
        ))}
      </nav>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-700 uppercase">System Live</span>
        </div>
      </div>
    </div>
  </header>
);

// Map Auto-center component
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

// --- Patient View ---
const PatientView = ({ socket }: { socket: any, key?: string }) => {
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [status, setStatus] = useState<'idle' | 'requesting' | 'searching' | 'assigned'>('idle');
  const [assignedAmbulance, setAssignedAmbulance] = useState<Ambulance | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'bot', text: 'Namaste! I am Dr Dost. How are you feeling today? Describe your symptoms, and I can suggest some traditional home remedies.' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAudioPaused, setIsAudioPaused] = useState(false);
  const [isLiveConsultation, setIsLiveConsultation] = useState(false);
  const [isRequestingAppointment, setIsRequestingAppointment] = useState(false);
  const [appointmentReason, setAppointmentReason] = useState('');
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [liveMessages, setLiveMessages] = useState<any[]>([]);
  const [assignedDoctor, setAssignedDoctor] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState(INDIAN_LANGUAGES[0]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'doctors' | 'labs' | 'ambulances'>('doctors');
  const [nearbyAmbulances, setNearbyAmbulances] = useState<Ambulance[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = selectedLanguage.code === 'auto' ? 'en-US' : selectedLanguage.code;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [selectedLanguage]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      if (recognitionRef.current) {
        recognitionRef.current.lang = selectedLanguage.code === 'auto' ? 'en-US' : selectedLanguage.code;
        recognitionRef.current.start();
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(newLoc);
          setMapCenter([newLoc.lat, newLoc.lng]);
        },
        (err) => {
          console.error(err);
          const fallback = { lat: 12.9716, lng: 77.5946 };
          setLocation(fallback);
          setMapCenter([fallback.lat, fallback.lng]);
        }
      );
    }
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSOS = () => {
    if (!location || !socket) return;
    setStatus('requesting');
    socket.emit('request_ambulance', {
      patient_name: 'Emergency User',
      lat: location.lat,
      lng: location.lng
    });
  };

  const toggleAudio = () => {
    if (!currentAudioRef.current) return;
    
    if (isAudioPaused) {
      currentAudioRef.current.play();
      setIsAudioPaused(false);
      setIsSpeaking(true);
    } else {
      currentAudioRef.current.pause();
      setIsAudioPaused(true);
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('consultation_started', (data: any) => {
      setConsultationId(data.consultationId);
      setAssignedDoctor(data.doctor);
      setIsLiveConsultation(true);
    });

    socket.on('new_live_message', (data: any) => {
      if (data.consultationId === consultationId) {
        setLiveMessages(prev => [...prev, data]);
      }
    });

    return () => {
      socket.off('consultation_started');
      socket.off('new_live_message');
    };
  }, [socket, consultationId]);

  const startLiveConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !appointmentReason.trim()) return;
    
    socket.emit('request_consultation', { 
      patient_id: socket.id, 
      patient_name: 'Patient ' + socket.id.slice(0, 4),
      reason: appointmentReason.trim()
    });
    setIsRequestingAppointment(false);
    setAppointmentReason('');
    alert("Appointment request sent! Please wait for a doctor to accept.");
  };

  const sendLiveMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !consultationId || !socket) return;
    
    socket.emit('send_live_message', {
      consultationId,
      sender_id: socket.id,
      text: userInput.trim()
    });
    setUserInput('');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() && !selectedImage) return;

    const userMessage = userInput.trim();
    const currentImage = selectedImage;
    
    setChatMessages(prev => [...prev, { 
      role: 'user', 
      text: userMessage || (currentImage ? "Sent an image for analysis" : "") 
    }]);
    
    setUserInput('');
    setSelectedImage(null);
    setIsTyping(true);

    try {
      const parts: any[] = [];
      if (userMessage) parts.push({ text: userMessage });
      if (currentImage) {
        parts.push({
          inlineData: {
            mimeType: "image/png",
            data: currentImage.split(',')[1]
          }
        });
      }

      const modelName = "gemini-2.5-flash";
      const model = genAI.models.generateContent({
        model: modelName,
        contents: { parts },
        config: {
          systemInstruction: `You are Dr Dost, an expert Ayurvedic consultant. Your goal is to provide safe, traditional Ayurvedic home remedies based on the symptoms or images described/shown by the user. 
          
          LANGUAGE INSTRUCTION:
          1. Detect the language of the user's input (text or image context).
          2. If the user has manually selected a language (Current selection: ${selectedLanguage.name}), use that as the primary response language.
          3. If the selection is 'Auto Detect', automatically identify the language used by the user and respond in that SAME language.
          4. For 'Hinglish', respond in a natural mix of Hindi and English.
          
          DOCTOR CONSULTATION & MAPS INSTRUCTION:
          - If the user mentions "doctor", "clinic", "hospital", "appointment", "consultation", "specialist", or "nearby help", you MUST use the googleMaps tool to find nearby doctors, clinics, or hospitals of all types (General Physicians, Specialists, etc.) within a 50km radius of the user's location.
          - If the user describes severe symptoms (e.g., chest pain, difficulty breathing, high fever, deep wounds, sudden numbness), immediately suggest seeking professional medical help and use the googleMaps tool to show nearby emergency services or doctors within a 50km radius.
          - When suggesting doctors via googleMaps, aim for at least 3 options with good ratings.
          - Mention the names and ratings of these places in your text response.
          
          AYURVEDIC ANALYSIS:
          - If an image is provided (e.g., a skin rash, a tongue, etc.), analyze it from an Ayurvedic perspective (Dosha imbalance) and suggest remedies. 
          - Always include a disclaimer that these are home remedies and not a substitute for professional medical advice, especially in emergencies. 
          - Keep responses concise, warm, and helpful. Use bullet points for remedies.`,
          tools: [{ googleMaps: {} }],
          toolConfig: location ? {
            retrievalConfig: {
              latLng: {
                latitude: location.lat,
                longitude: location.lng
              }
            }
          } : undefined
        }
      });
      
      const response = await model;
      const botResponse = response.text || "I apologize, I am unable to provide a remedy at this moment. Please consult a professional.";
      
      // Extract grounding metadata for maps
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const mapLinks = groundingChunks?.filter(chunk => chunk.maps?.uri).map(chunk => ({
        title: chunk.maps?.title || "View on Maps",
        url: chunk.maps?.uri
      }));

      setChatMessages(prev => [...prev, { 
        role: 'bot', 
        text: botResponse,
        links: mapLinks
      }]);

      // Generate Voice Output if it was a voice input or if user wants it
      if (botResponse) {
        try {
          const ttsResponse = await genAI.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: botResponse }] }],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
              },
            },
          });

          const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          if (base64Audio) {
            // Gemini TTS returns raw PCM 16-bit 24kHz. We need to wrap it in a WAV header for Audio()
            const pcmData = atob(base64Audio);
            const arrayBuffer = new ArrayBuffer(pcmData.length);
            const view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < pcmData.length; i++) {
              view[i] = pcmData.charCodeAt(i);
            }

            // Create WAV header
            const wavHeader = new ArrayBuffer(44);
            const d = new DataView(wavHeader);
            d.setUint32(0, 0x52494646, false); // "RIFF"
            d.setUint32(4, 36 + arrayBuffer.byteLength, true); // file size
            d.setUint32(8, 0x57415645, false); // "WAVE"
            d.setUint32(12, 0x666d7420, false); // "fmt "
            d.setUint32(16, 16, true); // length of fmt data
            d.setUint16(20, 1, true); // type (PCM)
            d.setUint16(22, 1, true); // channels (mono)
            d.setUint32(24, 24000, true); // sample rate
            d.setUint32(28, 24000 * 2, true); // byte rate (sample rate * block align)
            d.setUint16(32, 2, true); // block align (channels * bits per sample / 8)
            d.setUint16(34, 16, true); // bits per sample
            d.setUint32(36, 0x64617461, false); // "data"
            d.setUint32(40, arrayBuffer.byteLength, true); // data size

            const blob = new Blob([wavHeader, arrayBuffer], { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            currentAudioRef.current = audio;
            setIsSpeaking(true);
            setIsAudioPaused(false);
            
            audio.onended = () => {
              setIsSpeaking(false);
              setIsAudioPaused(false);
              currentAudioRef.current = null;
              URL.revokeObjectURL(url);
            };
            audio.play();
          }
        } catch (ttsErr) {
          console.error("TTS Error:", ttsErr);
        }
      }
    } catch (error) {
      console.error("Gemini Error:", error);
      setChatMessages(prev => [...prev, { role: 'bot', text: "I'm having trouble connecting to my knowledge base. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (!socket) return;
    socket.on('request_assigned', (data: any) => {
      setStatus('assigned');
      setAssignedAmbulance(data.ambulance);
    });
    socket.on('request_queued', () => setStatus('searching'));
    
    const fetchNearby = async () => {
      try {
        const res = await fetch('/api/ambulances');
        if (res.ok) {
          const data = await res.json();
          setNearbyAmbulances(data.filter((a: Ambulance) => a.status === 'available'));
        }
      } catch (err) {
        console.error("Failed to fetch nearby ambulances:", err);
      }
    };

    fetchNearby();
    socket.on('ambulance_updated', fetchNearby);

    return () => {
      socket.off('request_assigned');
      socket.off('request_queued');
      socket.off('ambulance_updated');
    };
  }, [socket]);

  return (
    <div className="max-w-5xl mx-auto pt-28 px-6 space-y-8">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-[2.5rem] p-8 text-white neo-shadow"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl -ml-24 -mb-24" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight">Welcome to SwiftRescue</h1>
            <p className="text-zinc-400 text-sm font-medium max-w-md">Your intelligent health companion for emergencies, consultations, and diagnostics.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active Status</p>
              <p className="text-emerald-400 font-black text-sm">System Online</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-10 neo-shadow border border-zinc-100 flex flex-col justify-center items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-amber-500 to-red-500" />
            <AnimatePresence mode="wait">
              {status === 'idle' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="space-y-10 w-full"
                >
                  <div className="relative mx-auto w-56 h-56">
                     <motion.div 
                      animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute inset-0 bg-red-500 rounded-full blur-2xl"
                     />
                     <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-red-100 rounded-full"
                     />
                     <button
                      onClick={handleSOS}
                      className="absolute inset-4 bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white rounded-full shadow-[0_20px_50px_rgba(239,68,68,0.4)] transition-all active:scale-95 flex flex-col items-center justify-center gap-2 z-10 border-4 border-white/20"
                    >
                      <Bell className="w-14 h-14 animate-bounce" />
                      <span className="text-4xl font-black tracking-tighter">SOS</span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-70">Emergency</span>
                    </button>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Emergency Assistance</h2>
                    <p className="text-zinc-500 mt-3 text-sm max-w-xs mx-auto leading-relaxed">Press the SOS button to dispatch the nearest ambulance to your location instantly.</p>
                  </div>
                </motion.div>
              )}

              {status !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 w-full"
                >
                  <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto">
                    {status === 'searching' ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                        <Navigation className="w-10 h-10 text-zinc-400" />
                      </motion.div>
                    ) : (
                      <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-900">
                      {status === 'searching' ? 'Searching...' : 'Help is coming!'}
                    </h2>
                    <p className="text-zinc-500 mt-2">
                      {status === 'searching' 
                        ? 'Finding the nearest available ambulance...' 
                        : `Ambulance ${assignedAmbulance?.name} has been dispatched.`}
                    </p>
                  </div>
                  {assignedAmbulance && (
                    <div className="bg-zinc-50 rounded-2xl p-4 flex items-center gap-4 text-left">
                      <div className="bg-white p-3 rounded-xl shadow-sm">
                        <Truck className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Assigned Unit</p>
                        <p className="font-bold text-zinc-900">{assignedAmbulance.name}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tabs for Doctors and Labs */}
          <div className="bg-white rounded-[2.5rem] p-8 neo-shadow border border-zinc-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex bg-zinc-100/80 backdrop-blur-sm p-1.5 rounded-2xl border border-zinc-200/50">
                <button
                  onClick={() => setActiveTab('doctors')}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 tracking-wide",
                    activeTab === 'doctors' 
                      ? "bg-white text-emerald-600 shadow-md ring-1 ring-zinc-200/50" 
                      : "text-zinc-500 hover:text-zinc-900"
                  )}
                >
                  <User className="w-4 h-4" />
                  DOCTORS
                </button>
                <button
                  onClick={() => setActiveTab('labs')}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 tracking-wide",
                    activeTab === 'labs' 
                      ? "bg-white text-emerald-600 shadow-md ring-1 ring-zinc-200/50" 
                      : "text-zinc-500 hover:text-zinc-900"
                  )}
                >
                  <Activity className="w-4 h-4" />
                  LABS
                </button>
                <button
                  onClick={() => setActiveTab('ambulances')}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 tracking-wide",
                    activeTab === 'ambulances' 
                      ? "bg-white text-emerald-600 shadow-md ring-1 ring-zinc-200/50" 
                      : "text-zinc-500 hover:text-zinc-900"
                  )}
                >
                  <Truck className="w-4 h-4" />
                  FLEET
                </button>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Demo Mode</span>
                <span className="text-[8px] font-bold text-emerald-500 uppercase mt-1">Live Directory</span>
              </div>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {activeTab === 'doctors' ? (
                DUMMY_DOCTORS.map(doc => (
                  <motion.div 
                    whileHover={{ y: -4 }}
                    key={doc.id} 
                    className="group p-5 bg-zinc-50 rounded-3xl border border-zinc-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-pointer neo-shadow"
                  >
                    <div className="flex gap-5">
                      <div className="relative">
                        <img 
                          src={doc.image} 
                          alt={doc.name} 
                          className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        <div className={cn(
                          "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white shadow-sm",
                          doc.status === 'online' ? "bg-emerald-500" : "bg-zinc-300"
                        )} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-zinc-900 text-base tracking-tight">{doc.name}</h4>
                              <span className={cn(
                                "text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter",
                                doc.status === 'online' ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                              )}>
                                {doc.status}
                              </span>
                            </div>
                            <p className="text-xs text-emerald-600 font-bold uppercase tracking-wide mt-0.5">{doc.domain}</p>
                          </div>
                          <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-zinc-100 shadow-sm">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span className="text-xs font-black text-zinc-800">{doc.rating}</span>
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-medium">
                            <div className="p-1 bg-white rounded-lg border border-zinc-100">
                              <Clock className="w-3 h-3 text-zinc-400" />
                            </div>
                            <span>{doc.schedule}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-medium">
                            <div className="p-1 bg-white rounded-lg border border-zinc-100">
                              <Activity className="w-3 h-3 text-emerald-500" />
                            </div>
                            <span className="font-black text-zinc-900">Fees: {doc.fees}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsRequestingAppointment(true);
                        setAppointmentReason(`Consultation request for ${doc.name} (${doc.domain})`);
                      }}
                      className="w-full mt-5 py-3 bg-white border-2 border-zinc-100 rounded-2xl text-xs font-black text-zinc-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm active:scale-95"
                    >
                      BOOK CONSULTATION
                    </button>
                  </motion.div>
                ))
              ) : activeTab === 'labs' ? (
                DUMMY_LABS.map(lab => (
                  <motion.div 
                    whileHover={{ y: -4 }}
                    key={lab.id} 
                    className="group p-5 bg-zinc-50 rounded-3xl border border-zinc-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-pointer neo-shadow"
                  >
                    <div className="flex gap-5">
                      <img 
                        src={lab.image} 
                        alt={lab.name} 
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-black text-zinc-900 text-base tracking-tight">{lab.name}</h4>
                            <p className="text-xs text-emerald-600 font-bold uppercase tracking-wide flex items-center gap-1.5 mt-0.5">
                              <MapPin className="w-3.5 h-3.5" />
                              {lab.location}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-zinc-100 shadow-sm">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span className="text-xs font-black text-zinc-800">{lab.rating}</span>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Available Services</p>
                          <div className="grid grid-cols-1 gap-1.5">
                            {lab.services.map((service, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-white px-3 py-1.5 rounded-xl border border-zinc-100 shadow-sm">
                                <span className="text-[10px] font-medium text-zinc-600">{service.name}</span>
                                <span className="text-[10px] font-black text-emerald-700">{service.cost}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsRequestingAppointment(true);
                        setAppointmentReason(`Lab test inquiry for ${lab.name}`);
                      }}
                      className="w-full mt-5 py-3 bg-white border-2 border-zinc-100 rounded-2xl text-xs font-black text-zinc-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm active:scale-95"
                    >
                      BOOK LAB TEST
                    </button>
                  </motion.div>
                ))
              ) : (
                nearbyAmbulances.map(amb => (
                  <motion.div 
                    whileHover={{ y: -4 }}
                    key={amb.id} 
                    onClick={() => setMapCenter([amb.lat, amb.lng])}
                    className="group p-5 bg-zinc-50 rounded-3xl border border-zinc-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-pointer neo-shadow"
                  >
                    <div className="flex gap-5 items-center">
                      <div className="w-16 h-16 bg-white rounded-2xl neo-shadow flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Truck className="w-8 h-8 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-black text-zinc-900 text-base tracking-tight">{amb.name}</h4>
                            <p className="text-[10px] text-zinc-400 font-mono mt-1 uppercase tracking-widest">{amb.id}</p>
                          </div>
                          <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-700 uppercase">Available</span>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-4">
                          <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-medium">
                            <MapPin className="w-3 h-3 text-zinc-400" />
                            <span>{amb.lat.toFixed(4)}, {amb.lng.toFixed(4)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Map View */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-[2.5rem] neo-shadow border border-zinc-100 overflow-hidden h-[500px] relative group">
            {location ? (
              <MapContainer 
                center={mapCenter || [location.lat, location.lng]} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[location.lat, location.lng]} icon={patientIcon}>
                  <Popup>Your Location</Popup>
                </Marker>
                {assignedAmbulance && (
                  <Marker position={[assignedAmbulance.lat, assignedAmbulance.lng]} icon={ambulanceIcon}>
                    <Popup>{assignedAmbulance.name} (Coming to you)</Popup>
                  </Marker>
                )}
                {nearbyAmbulances.filter(a => !assignedAmbulance || a.id !== assignedAmbulance.id).map(amb => (
                  <Marker key={amb.id} position={[amb.lat, amb.lng]} icon={ambulanceIcon}>
                    <Popup>
                      <div className="p-1">
                        <p className="font-black text-xs">{amb.name}</p>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase">Available</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                <ChangeView center={mapCenter || [location.lat, location.lng]} zoom={13} />
              </MapContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-zinc-50 text-zinc-400 gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl neo-shadow flex items-center justify-center">
                  <MapPin className="w-8 h-8 animate-pulse text-emerald-500" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest">Detecting Location...</p>
              </div>
            )}
            <div className="absolute top-6 left-6 z-[1000]">
               <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3 border border-white/20 neo-shadow flex items-center gap-3">
                  <div className="bg-emerald-500 p-1.5 rounded-lg">
                    <Navigation className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-zinc-400 uppercase leading-none">Live GPS</span>
                    <span className="text-xs font-black text-zinc-900 mt-1">
                      {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Searching...'}
                    </span>
                  </div>
               </div>
            </div>
            <div className="absolute bottom-6 right-6 z-[1000]">
               <button 
                onClick={() => location && setMapCenter([location.lat, location.lng])}
                className="bg-zinc-900 text-white p-3 rounded-2xl neo-shadow hover:scale-110 transition-transform"
               >
                  <Target className="w-5 h-5" />
               </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <div 
              onClick={() => window.location.href = 'tel:9142017698'}
              className="bg-emerald-600 rounded-3xl p-6 text-white neo-shadow group cursor-pointer hover:bg-emerald-700 transition-all active:scale-95"
            >
              <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
              <p className="font-black text-sm tracking-tight">Call Doctor</p>
              <p className="text-[10px] opacity-60 font-bold uppercase mt-1">24/7 Support</p>
            </div>
            <div className="bg-zinc-900 rounded-3xl p-6 text-white neo-shadow group cursor-pointer hover:bg-zinc-800 transition-all">
              <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <p className="font-black text-sm tracking-tight">Health Records</p>
              <p className="text-[10px] opacity-60 font-bold uppercase mt-1">Secure Vault</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ayurvedic Chatbot Section */}
      <div className="fixed bottom-24 right-6 z-[1000]">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-80 md:w-96 h-[600px] rounded-[2.5rem] shadow-2xl border border-zinc-100 flex flex-col overflow-hidden mb-4 neo-shadow"
            >
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl border border-white/20">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black text-base tracking-tight leading-none">Dr Dost</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <select 
                        value={selectedLanguage.name}
                        onChange={(e) => {
                          const lang = INDIAN_LANGUAGES.find(l => l.name === e.target.value);
                          if (lang) setSelectedLanguage(lang);
                        }}
                        className="bg-transparent text-[10px] font-black uppercase tracking-widest border-none p-0 focus:ring-0 cursor-pointer outline-none opacity-80 hover:opacity-100 transition-opacity"
                      >
                        {INDIAN_LANGUAGES.map(lang => (
                          <option key={lang.name} value={lang.name} className="text-zinc-900">{lang.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-2 rounded-xl transition-colors relative z-10">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 relative">
                <div className="sticky top-0 z-10 flex justify-center pointer-events-none">
                  <div className="pointer-events-auto">
                    <DoctorAnimation isSpeaking={isSpeaking} />
                  </div>
                </div>
                
                {/* Audio Controls Overlay */}
                {(isSpeaking || isAudioPaused) && currentAudioRef.current && (
                  <div className="sticky top-32 z-20 flex justify-center mb-4">
                    <motion.button
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={toggleAudio}
                      className="bg-white/90 backdrop-blur-sm border border-emerald-100 shadow-lg rounded-full px-4 py-2 flex items-center gap-2 text-emerald-700 text-xs font-medium hover:bg-emerald-50 transition-colors"
                    >
                      {isAudioPaused ? (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>Resume Voice</span>
                        </>
                      ) : (
                        <>
                          <Pause className="w-3 h-3 fill-current" />
                          <span>Pause Voice</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                )}

                {chatMessages.map((msg, i) => (
                  <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[80%] p-3 rounded-2xl text-sm shadow-sm",
                      msg.role === 'user' 
                        ? "bg-emerald-600 text-white rounded-tr-none" 
                        : "bg-white text-zinc-800 border border-zinc-100 rounded-tl-none"
                    )}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      {msg.links && msg.links.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-zinc-100 space-y-2">
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Nearby Consultations:</p>
                          {msg.links.map((link, idx) => (
                            <a 
                              key={idx} 
                              href={link.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-xs text-emerald-700 hover:underline bg-emerald-50 p-2 rounded-lg transition-colors"
                            >
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{link.title}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-zinc-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-zinc-400 rounded-full" />
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-zinc-400 rounded-full" />
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-zinc-400 rounded-full" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {selectedImage && (
                <div className="px-4 py-2 bg-zinc-100 border-t border-zinc-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={selectedImage} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-zinc-300" />
                    <span className="text-xs text-zinc-500">Image attached</span>
                  </div>
                  <button onClick={() => setSelectedImage(null)} className="text-zinc-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-zinc-100 flex flex-col gap-2">
                <div className="flex gap-2 items-center">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={cn(
                        "p-2 rounded-xl transition-all",
                        isListening ? "bg-red-100 text-red-600 animate-pulse" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                      )}
                      title={isListening ? "Stop listening" : "Start voice input"}
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 rounded-xl bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-all"
                      title="Upload image"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={isListening ? "Listening..." : "Describe your symptoms..."}
                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button 
                    type="submit"
                    disabled={(!userInput.trim() && !selectedImage) || isTyping}
                    className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsRequestingAppointment(true)}
                  className="w-full bg-zinc-900 text-white py-2 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Book Live Appointment
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Appointment Request Form Modal */}
        <AnimatePresence>
          {isRequestingAppointment && (
            <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-zinc-900">Book Appointment</h3>
                  <button onClick={() => setIsRequestingAppointment(false)} className="text-zinc-400 hover:text-zinc-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={startLiveConsultation} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Reason for consultation</label>
                    <textarea
                      required
                      value={appointmentReason}
                      onChange={(e) => setAppointmentReason(e.target.value)}
                      placeholder="e.g. Severe stomach pain since morning..."
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 h-32 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all"
                  >
                    Send Request
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Live Consultation Modal */}
        <AnimatePresence>
          {isLiveConsultation && (
            <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 bg-zinc-900/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-lg h-[600px] flex flex-col"
              >
                <div className="bg-emerald-600 p-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-xl">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold">{assignedDoctor?.name || 'Doctor'}</p>
                      <p className="text-xs opacity-80">{assignedDoctor?.specialization || 'Ayurvedic Specialist'}</p>
                    </div>
                  </div>
                  <button onClick={() => setIsLiveConsultation(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50">
                  {liveMessages.map((msg, i) => (
                    <div key={i} className={cn("flex", msg.sender_id === socket.id ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[80%] p-3 rounded-2xl text-sm shadow-sm",
                        msg.sender_id === socket.id 
                          ? "bg-emerald-600 text-white rounded-tr-none" 
                          : "bg-white text-zinc-800 border border-zinc-100 rounded-tl-none"
                      )}>
                        <p>{msg.text}</p>
                        <p className="text-[10px] opacity-50 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={sendLiveMessage} className="p-4 bg-white border-t border-zinc-100 flex gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-zinc-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={cn(
            "w-16 h-16 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex items-center justify-center transition-all active:scale-90 group relative overflow-hidden",
            isChatOpen ? "bg-zinc-900 text-white" : "bg-emerald-600 text-white"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {isChatOpen ? <X className="w-7 h-7" /> : <MessageSquare className="w-7 h-7" />}
          {!isChatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md border-2 border-white shadow-sm"
            >
              1
            </motion.div>
          )}
        </button>
      </div>
    </div>
  );
};

// --- Ambulance View ---
const AmbulanceView = ({ socket }: { socket: any, key?: string }) => {
  const [ambulanceId, setAmbulanceId] = useState('AMB-001');
  const [status, setStatus] = useState<Status>('available');
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);

  useEffect(() => {
    fetch('/api/ambulances').then(res => res.json()).then(setAmbulances);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(newLoc);
          if (socket) {
            socket.emit('update_ambulance', { id: ambulanceId, ...newLoc, status });
          }
        });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [socket, ambulanceId, status]);

  return (
    <div className="max-w-md mx-auto pt-24 px-4 space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-zinc-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-zinc-100 p-2 rounded-xl">
              <Shield className="w-5 h-5 text-zinc-600" />
            </div>
            <div>
              <h2 className="font-bold text-zinc-900">Unit Dashboard</h2>
              <p className="text-xs text-zinc-500">ID: {ambulanceId}</p>
            </div>
          </div>
          <select 
            value={ambulanceId}
            onChange={(e) => setAmbulanceId(e.target.value)}
            className="text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1"
          >
            {ambulances.map(a => (
              <option key={a.id} value={a.id}>{a.id}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setStatus('available')}
            className={cn(
              "p-4 rounded-2xl border-2 transition-all text-center space-y-2",
              status === 'available' 
                ? "bg-emerald-50 border-emerald-500 text-emerald-700" 
                : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200"
            )}
          >
            <CheckCircle2 className="w-6 h-6 mx-auto" />
            <span className="block font-bold">Available</span>
          </button>
          <button
            onClick={() => setStatus('busy')}
            className={cn(
              "p-4 rounded-2xl border-2 transition-all text-center space-y-2",
              status === 'busy' 
                ? "bg-amber-50 border-amber-500 text-amber-700" 
                : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200"
            )}
          >
            <Clock className="w-6 h-6 mx-auto" />
            <span className="block font-bold">Busy</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">GPS Status</span>
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Active
            </span>
          </div>
          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 font-mono text-xs text-zinc-600">
            {location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : 'Locating...'}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Admin View ---
const AdminView = ({ socket }: { socket: any, key?: string }) => {
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newAmb, setNewAmb] = useState({ id: '', name: '', pincode: '' });

  const fetchData = useCallback(async () => {
    const [ambRes, reqRes] = await Promise.all([
      fetch('/api/ambulances'),
      fetch('/api/requests')
    ]);
    setAmbulances(await ambRes.json());
    setRequests(await reqRes.json());
  }, []);

  useEffect(() => {
    fetchData();
    if (!socket) return;
    socket.on('ambulance_updated', fetchData);
    socket.on('request_assigned', fetchData);
    socket.on('request_queued', fetchData);
    return () => {
      socket.off('ambulance_updated');
      socket.off('request_assigned');
      socket.off('request_queued');
    };
  }, [socket, fetchData]);

  const handleAddAmbulance = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/ambulances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAmb)
    });
    if (res.ok) {
      setIsAdding(false);
      setNewAmb({ id: '', name: '', pincode: '' });
      fetchData();
    } else {
      alert('Failed to add ambulance. ID might already exist.');
    }
  };

  const handleDeployTollUnits = async () => {
    const res = await fetch('/api/ambulances/toll-plazas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ radius: 100000 }) // 100km radius
    });
    if (res.ok) {
      const data = await res.json();
      alert(`Successfully deployed ${data.count} ambulances at nearby toll plazas!`);
      fetchData();
    } else {
      alert('Failed to deploy toll plaza units.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto pt-24 px-4 pb-12 space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
          <p className="text-zinc-500 text-sm font-medium">Active Ambulances</p>
          <p className="text-3xl font-bold text-zinc-900 mt-1">{ambulances.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
          <p className="text-zinc-500 text-sm font-medium">Available Units</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">
            {ambulances.filter(a => a.status === 'available').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
          <p className="text-zinc-500 text-sm font-medium">Total Requests</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{requests.length}</p>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-white rounded-3xl border border-zinc-100 shadow-xl overflow-hidden h-[500px] relative">
        <MapContainer 
          center={[12.9716, 77.5946]} 
          zoom={5} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {ambulances.map(amb => (
            <Marker key={amb.id} position={[amb.lat, amb.lng]} icon={ambulanceIcon}>
              <Popup>
                <div className="p-2">
                  <p className="font-bold">{amb.name}</p>
                  <p className="text-xs text-zinc-500 uppercase">{amb.status}</p>
                </div>
              </Popup>
            </Marker>
          ))}
          {requests.filter(r => r.status !== 'completed').map(req => (
            <Marker key={req.id} position={[req.patient_lat, req.patient_lng]} icon={patientIcon}>
              <Popup>
                <div className="p-2">
                  <p className="font-bold">Patient: {req.patient_name}</p>
                  <p className="text-xs text-red-500 font-bold uppercase">{req.status}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        <div className="absolute top-4 right-4 z-[1000] flex gap-2">
          <button 
            onClick={handleDeployTollUnits}
            className="bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 hover:bg-emerald-700 transition-all"
          >
            <MapIcon className="w-4 h-4" />
            Deploy Toll Units
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-zinc-900 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 hover:bg-zinc-800 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Ambulance
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Fleet List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-zinc-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-zinc-400" />
            Fleet Status
          </h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {ambulances.map(amb => (
              <div key={amb.id} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    amb.status === 'available' ? "bg-emerald-50" : "bg-amber-50"
                  )}>
                    <Truck className={cn(
                      "w-5 h-5",
                      amb.status === 'available' ? "text-emerald-600" : "text-amber-600"
                    )} />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900 text-sm">{amb.name}</p>
                    <p className="text-[10px] text-zinc-400 font-mono">{amb.lat.toFixed(3)}, {amb.lng.toFixed(3)}</p>
                  </div>
                </div>
                <span className={cn(
                  "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                  amb.status === 'available' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                )}>
                  {amb.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Requests */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-zinc-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-zinc-400" />
            Recent Emergency Requests
          </h3>
          <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-100">
                <tr>
                  <th className="px-6 py-4 font-bold text-zinc-500">Patient</th>
                  <th className="px-6 py-4 font-bold text-zinc-500">Status</th>
                  <th className="px-6 py-4 font-bold text-zinc-500">Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-zinc-400" />
                        <span className="font-medium text-zinc-900">{req.patient_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                        req.status === 'assigned' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      )}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">
                      {req.ambulance_id || '---'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Ambulance Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative"
            >
              <button onClick={() => setIsAdding(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-600">
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-zinc-900 mb-6">Register New Unit</h2>
              <form onSubmit={handleAddAmbulance} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Unit ID (e.g. AMB-004)</label>
                  <input 
                    required
                    type="text" 
                    value={newAmb.id}
                    onChange={e => setNewAmb({...newAmb, id: e.target.value})}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Unit Name</label>
                  <input 
                    required
                    type="text" 
                    value={newAmb.name}
                    onChange={e => setNewAmb({...newAmb, name: e.target.value})}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Area Pincode</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. 560001"
                    value={newAmb.pincode}
                    onChange={e => setNewAmb({...newAmb, pincode: e.target.value})}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all mt-4"
                >
                  Register Unit
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Doctor View ---
const DoctorView = ({ socket }: { socket: any, key?: string }) => {
  const [pendingConsultations, setPendingConsultations] = useState<any[]>([]);
  const [activeConsultation, setActiveConsultation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [userInput, setUserInput] = useState('');
  const doctorId = "DR-001"; // Mock doctor ID

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await fetch('/api/consultations/pending');
        if (res.ok) {
          const data = await res.json();
          // Map database fields to match socket event structure
          setPendingConsultations(data.map((c: any) => ({
            consultationId: c.id,
            patient_id: c.patient_id,
            patient_name: c.patient_name,
            reason: c.reason
          })));
        }
      } catch (err) {
        console.error("Failed to fetch pending consultations:", err);
      }
    };
    fetchPending();

    if (!socket) return;

    socket.on('consultation_requested', (data: any) => {
      setPendingConsultations(prev => [...prev, data]);
    });

    socket.on('consultation_started', (data: any) => {
      if (data.doctor.id === doctorId) {
        setActiveConsultation(data);
      }
    });

    socket.on('new_live_message', (data: any) => {
      if (activeConsultation && data.consultationId === activeConsultation.consultationId) {
        setMessages(prev => [...prev, data]);
      }
    });

    return () => {
      socket.off('consultation_requested');
      socket.off('consultation_started');
      socket.off('new_live_message');
    };
  }, [socket, activeConsultation]);

  const acceptConsultation = (consultation: any) => {
    if (!socket) return;
    socket.emit('accept_consultation', {
      consultationId: consultation.consultationId,
      doctor_id: doctorId
    });
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !activeConsultation || !socket) return;
    
    socket.emit('send_live_message', {
      consultationId: activeConsultation.consultationId,
      sender_id: doctorId,
      text: userInput.trim()
    });
    setUserInput('');
  };

  return (
    <div className="max-w-4xl mx-auto pt-24 px-4 pb-12 grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-zinc-100">
          <h2 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            Pending Requests
          </h2>
          <div className="space-y-3">
            {pendingConsultations.length === 0 && (
              <p className="text-zinc-400 text-sm text-center py-8 italic">No pending requests</p>
            )}
            {pendingConsultations.map((c, i) => (
              <div key={i} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-zinc-900">{c.patient_name}</p>
                    <p className="text-[10px] text-zinc-500 uppercase">Awaiting Doctor</p>
                  </div>
                  <button 
                    onClick={() => acceptConsultation(c)}
                    className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all"
                  >
                    Accept
                  </button>
                </div>
                <div className="bg-white p-3 rounded-xl border border-zinc-100">
                  <p className="text-xs text-zinc-600 italic">"{c.reason}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="md:col-span-2">
        {activeConsultation ? (
          <div className="bg-white rounded-3xl shadow-xl border border-zinc-100 h-[600px] flex flex-col overflow-hidden">
            <div className="bg-zinc-900 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-xl">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold">Chat with {activeConsultation.patient_name}</p>
                  <p className="text-xs opacity-60">Active Session</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveConsultation(null)}
                className="text-xs bg-white/10 px-3 py-1 rounded-lg hover:bg-white/20 transition-all"
              >
                End Session
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.sender_id === doctorId ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] p-3 rounded-2xl text-sm shadow-sm",
                    msg.sender_id === doctorId 
                      ? "bg-zinc-900 text-white rounded-tr-none" 
                      : "bg-white text-zinc-800 border border-zinc-100 rounded-tl-none"
                  )}>
                    <p>{msg.text}</p>
                    <p className="text-[10px] opacity-50 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={sendMessage} className="p-4 bg-white border-t border-zinc-100 flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your medical advice..."
                className="flex-1 bg-zinc-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-zinc-900 outline-none"
              />
              <button
                type="submit"
                className="p-2 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border-2 border-dashed border-zinc-200 h-[600px] flex flex-col items-center justify-center text-center p-12">
            <div className="bg-zinc-100 p-6 rounded-full mb-6">
              <Bot className="w-12 h-12 text-zinc-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">Consultation Dashboard</h2>
            <p className="text-zinc-500 max-w-sm">
              Select a pending request from the left panel to start a live consultation with a patient.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [view, setView] = useState<View>('patient');
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);
    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-red-100 selection:text-red-900">
      <Header currentView={view} setView={setView} />
      
      <main className="pb-20">
        <AnimatePresence mode="wait">
          {view === 'patient' && <PatientView key="patient" socket={socket} />}
          {view === 'ambulance' && <AmbulanceView key="ambulance" socket={socket} />}
          {view === 'admin' && <AdminView key="admin" socket={socket} />}
          {view === 'doctor' && <DoctorView key="doctor" socket={socket} />}
        </AnimatePresence>
      </main>

      {/* Footer Branding */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 text-center pointer-events-none z-[1000]">
        <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-[0.2em]">
          SwiftRescue Protocol v1.1.0 • Prototype System
        </p>
      </footer>
    </div>
  );
}

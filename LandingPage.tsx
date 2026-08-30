import { 
  Activity, 
  AlertCircle, 
  Shield, 
  Truck, 
  User, 
  MessageSquare, 
  MapPin, 
  Sparkles, 
  Bot, 
  Phone, 
  Navigation, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Stethoscope,
  Radio,
  Zap,
  Globe,
  Download,
  Smartphone
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from './lib/utils';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'driver' | 'admin' | 'doctor';
}

interface LandingPageProps {
  key?: string;
  onSelectRole: (role: 'user' | 'driver' | 'admin' | 'doctor', user?: UserAccount) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  currentUser: UserAccount | null;
  onLogout: () => void;
  onOpenDownloadModal?: () => void;
}

export default function LandingPage({ 
  onSelectRole, 
  onOpenAuth, 
  currentUser,
  onLogout,
  onOpenDownloadModal
}: LandingPageProps) {
  const DEMO_ROLES = [
    {
      role: 'user' as const,
      title: 'Citizen / Patient',
      email: 'patient@swiftrescue.org',
      icon: User,
      badge: 'Public Portal',
      badgeColor: 'bg-red-50 text-red-700 border-red-200',
      accentColor: 'from-red-500 to-rose-600',
      description: 'Trigger 1-click SOS emergency dispatch, consult Dr. Dost AI, and book doctor appointments.',
      features: ['1-Click SOS GPS Dispatch', 'Dr. Dost Ayurvedic AI Chat', 'Doctor & Lab Booking']
    },
    {
      role: 'driver' as const,
      title: 'Ambulance Driver',
      email: 'driver@swiftrescue.org',
      icon: Truck,
      badge: 'Fleet Unit',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      accentColor: 'from-amber-500 to-orange-600',
      description: 'Receive emergency patient assignments, stream live GPS telemetry, and update unit availability.',
      features: ['Live GPS Telemetry Sync', 'Status Toggles (Available/Busy)', 'Patient Route Tracking']
    },
    {
      role: 'admin' as const,
      title: 'System Administrator',
      email: 'admin@swiftrescue.org',
      icon: Shield,
      badge: 'Command Center',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      accentColor: 'from-indigo-600 to-violet-700',
      description: 'Monitor nationwide fleet telemetry, deploy highway toll plaza units, and manage response queues.',
      features: ['Live Fleet Command Map', 'Toll Plaza Overpass Integration', 'Emergency Dispatch Queue']
    },
    {
      role: 'doctor' as const,
      title: 'Medical Specialist',
      email: 'doctor@swiftrescue.org',
      icon: Stethoscope,
      badge: 'Telehealth Portal',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      accentColor: 'from-blue-600 to-cyan-600',
      description: 'Accept incoming patient teleconsultation requests and provide real-time medical guidance.',
      features: ['Live Patient Video/Chat', 'Triage & Remedy Suggestions', 'Prescription Notes']
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 selection:bg-red-100 selection:text-red-900 pb-20">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20 neo-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-red-500 to-red-700 p-2 sm:p-2.5 rounded-2xl shadow-lg shadow-red-200">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <span className="font-black text-zinc-900 tracking-tight text-base sm:text-xl">SwiftRescue</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Protocol v1.1
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={onOpenDownloadModal}
              className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold shadow-sm transition-all active:scale-95 border border-zinc-700"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Get APK</span>
            </button>

            <a 
              href="tel:112"
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold shadow-md shadow-red-200 transition-all active:scale-95"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>112 Emergency</span>
            </a>

            {currentUser ? (
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-zinc-200 shadow-sm">
                <span className="text-xs font-bold text-zinc-800 hidden sm:inline">{currentUser.name}</span>
                <span className="text-[10px] font-bold uppercase bg-zinc-100 px-2 py-0.5 rounded-md text-zinc-600">
                  {currentUser.role}
                </span>
                <button
                  onClick={onLogout}
                  className="text-xs font-bold text-red-600 hover:text-red-700 ml-1"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-all shadow-md active:scale-95"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-28 sm:pt-36 pb-12 sm:pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-red-50 text-red-700 border border-red-200/80 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider"
          >
            <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" />
            <span>AI-Driven Emergency Health & Ambulance Network</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-zinc-900 tracking-tight leading-[1.1]"
          >
            Every Second Counts.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-amber-600">
              Autonomous Dispatch & AI Care.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-zinc-600 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            SwiftRescue bridges the critical response gap using real-time GPS telemetry, nearest-unit Haversine matching, multilingual Ayurvedic AI symptom triage, and live teleconsultation.
          </motion.p>

          {/* Quick Launch Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2"
          >
            <button
              onClick={() => onSelectRole('user')}
              className="px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-2xl font-black text-sm shadow-xl shadow-red-200 flex items-center gap-2.5 transition-all active:scale-95 group"
            >
              <AlertCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Launch Emergency SOS</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onOpenDownloadModal}
              className="px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-zinc-900 to-zinc-800 hover:from-zinc-800 hover:to-zinc-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-zinc-200 flex items-center gap-2.5 transition-all active:scale-95"
            >
              <Download className="w-5 h-5 text-emerald-400" />
              <span>Download Android APK</span>
            </button>

            <button
              onClick={() => onSelectRole('user')}
              className="px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-zinc-900 hover:bg-zinc-50 border border-zinc-200/80 rounded-2xl font-black text-sm shadow-sm flex items-center gap-2.5 transition-all active:scale-95"
            >
              <Bot className="w-5 h-5 text-emerald-600" />
              <span>Talk to Dr. Dost AI</span>
            </button>
          </motion.div>

          {/* Live Telemetry Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-8"
          >
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-zinc-100 shadow-sm">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Active Ambulances</p>
              <p className="text-2xl sm:text-3xl font-black text-zinc-900 mt-1">100+ Units</p>
              <span className="text-[10px] text-emerald-600 font-bold">● GPS Live Sync</span>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-zinc-100 shadow-sm">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Avg Response Time</p>
              <p className="text-2xl sm:text-3xl font-black text-red-600 mt-1">&lt; 7.2 Mins</p>
              <span className="text-[10px] text-zinc-500 font-medium">Haversine Routed</span>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-zinc-100 shadow-sm">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">AI Triage Speed</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">&lt; 400 ms</p>
              <span className="text-[10px] text-zinc-500 font-medium">Groq & Gemini Dual Engine</span>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-zinc-100 shadow-sm">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Languages</p>
              <p className="text-2xl sm:text-3xl font-black text-indigo-600 mt-1">10+ Indic</p>
              <span className="text-[10px] text-zinc-500 font-medium">Auto-Detect & Voice TTS</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Role-Based Quick Access Portal */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-black text-red-600 uppercase tracking-widest">Role-Based Access</span>
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">
            Choose Your Platform Portal
          </h2>
          <p className="text-zinc-500 text-sm font-medium max-w-xl mx-auto">
            Experience role-specific dashboards with pre-authenticated demo permissions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DEMO_ROLES.map((roleCard) => {
            const Icon = roleCard.icon;
            return (
              <motion.div
                key={roleCard.role}
                whileHover={{ y: -6 }}
                className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-xl flex flex-col justify-between relative overflow-hidden group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shadow-md",
                      roleCard.accentColor
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={cn("text-[9px] font-black uppercase px-2.5 py-1 rounded-full border", roleCard.badgeColor)}>
                      {roleCard.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-zinc-900 tracking-tight">{roleCard.title}</h3>
                    <p className="text-xs text-zinc-500 mt-2 leading-relaxed">{roleCard.description}</p>
                  </div>

                  <div className="pt-2 space-y-1.5">
                    {roleCard.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px] text-zinc-600 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-zinc-100">
                  <button
                    onClick={() => onSelectRole(roleCard.role)}
                    className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 group-hover:bg-red-600 active:scale-95"
                  >
                    <span>Enter as {roleCard.title.split(' ')[0]}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="bg-zinc-900 rounded-[2.5rem] p-8 sm:p-14 text-white neo-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/15 rounded-full blur-3xl -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl -ml-48 -mb-48" />

          <div className="relative z-10 space-y-12">
            <div className="max-w-2xl space-y-3">
              <span className="text-xs font-black text-red-400 uppercase tracking-widest">Built For Critical Scenarios</span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                Architected for Rapid Emergency Response
              </h2>
              <p className="text-zinc-400 text-sm font-medium">
                Combining telemetry, spatial algorithms, and large language models for dependable emergency care.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                  <Navigation className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base">Haversine GPS Routing</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Real-time distance calculation pinpointing the nearest available ambulance unit dynamically.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base">Dr. Dost AI Assistant</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Groq LLM-powered multilingual triage, Dosha analysis, and voice-assisted emergency advice.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base">Live Doctor Consultations</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Bidirectional Socket.io chat connecting patients directly with certified practitioners.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base">Toll Plaza Highway Grid</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Overpass API mapping emergency units at highway toll plazas for rapid accident response.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Workflow Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-black text-red-600 uppercase tracking-widest">Workflow</span>
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">
            How SwiftRescue Works in 3 Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm relative space-y-4 text-center">
            <div className="w-14 h-14 bg-red-50 text-red-600 font-black text-xl rounded-2xl flex items-center justify-center mx-auto border border-red-100">
              1
            </div>
            <h3 className="font-bold text-lg text-zinc-900">Trigger SOS or AI Triage</h3>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Patient presses the emergency SOS button to broadcast GPS coordinates or describes symptoms to Dr. Dost AI.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm relative space-y-4 text-center">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 font-black text-xl rounded-2xl flex items-center justify-center mx-auto border border-amber-100">
              2
            </div>
            <h3 className="font-bold text-lg text-zinc-900">Autonomous Matching</h3>
            <p className="text-zinc-500 text-xs leading-relaxed">
              The dispatch engine calculates shortest distances and assigns the closest available ambulance unit instantly via Socket.io.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm relative space-y-4 text-center">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 font-black text-xl rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
              3
            </div>
            <h3 className="font-bold text-lg text-zinc-900">Live GPS & Doctor Connect</h3>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Patient tracks the ambulance live on Leaflet maps while receiving pre-arrival doctor telehealth guidance.
            </p>
          </div>
        </div>
      </section>

      {/* Android APK Download Card Banner */}
      <section className="px-4 sm:px-6 max-w-7xl mx-auto my-12">
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 text-white rounded-[2.5rem] p-8 sm:p-12 relative overflow-hidden shadow-2xl border border-zinc-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 text-red-400 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Native Android Experience</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Install SwiftRescue Android App (APK)
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Enjoy 1-Click SOS home screen widgets, uninterrupted background GPS synchronization, and offline Ayurvedic symptom guidance even in areas with weak cellular reception.
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs font-bold text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>v2.4.0 (Latest Release)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>8.4 MB Lightweight Package</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>100% Virus & Malware Free</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto flex-shrink-0">
              <button
                onClick={onOpenDownloadModal}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-red-600/30 transition-all active:scale-95 flex items-center justify-center gap-2.5"
              >
                <Download className="w-5 h-5" />
                <span>Download APK (8.4 MB)</span>
              </button>
              <p className="text-[11px] text-zinc-500 text-center">Compatible with all Android 8.0+ smartphones</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 border-t border-zinc-200/80 pt-8 pb-12 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <p className="font-black text-zinc-900">SwiftRescue Emergency Protocol</p>
          <p className="text-xs text-zinc-400 mt-1">Prototype System for Smart Emergency Healthcare Dispatch</p>
        </div>
        <div className="flex items-center gap-6 text-xs font-bold text-zinc-500">
          <button onClick={() => onSelectRole('user')} className="hover:text-zinc-900">Emergency SOS</button>
          <button onClick={() => onSelectRole('driver')} className="hover:text-zinc-900">Driver Portal</button>
          <button onClick={() => onSelectRole('admin')} className="hover:text-zinc-900">Command Center</button>
          <button onClick={() => onSelectRole('doctor')} className="hover:text-zinc-900">Doctors</button>
        </div>
      </footer>
    </div>
  );
}

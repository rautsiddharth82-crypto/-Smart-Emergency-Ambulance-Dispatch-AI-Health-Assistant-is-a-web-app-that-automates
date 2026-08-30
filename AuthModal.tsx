import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, Truck, Stethoscope, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserAccount } from './LandingPage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  onAuthSuccess: (user: UserAccount) => void;
}

export default function AuthModal({ isOpen, onClose, mode: initialMode, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'user' | 'driver' | 'admin' | 'doctor'>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = mode === 'login' ? { email, password } : { name, email, password, role };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onAuthSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoRole: 'user' | 'driver' | 'admin' | 'doctor') => {
    const credentials = {
      user: { email: 'patient@swiftrescue.org', password: 'patient123' },
      driver: { email: 'driver@swiftrescue.org', password: 'driver123' },
      admin: { email: 'admin@swiftrescue.org', password: 'admin123' },
      doctor: { email: 'doctor@swiftrescue.org', password: 'doctor123' }
    };

    const target = credentials[demoRole];
    setEmail(target.email);
    setPassword(target.password);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(target)
      });

      const data = await res.json();
      if (!res.ok) {
        // Fallback demo user if backend is fresh
        const fallbackUser: UserAccount = {
          id: `USR-DEMO-${demoRole}`,
          name: demoRole === 'user' ? 'Demo Citizen' : demoRole === 'driver' ? 'Demo Driver' : demoRole === 'admin' ? 'Demo Admin' : 'Demo Doctor',
          email: target.email,
          role: demoRole
        };
        onAuthSuccess(fallbackUser);
        onClose();
        return;
      }

      onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      const fallbackUser: UserAccount = {
        id: `USR-DEMO-${demoRole}`,
        name: demoRole === 'user' ? 'Demo Citizen' : demoRole === 'driver' ? 'Demo Driver' : demoRole === 'admin' ? 'Demo Admin' : 'Demo Doctor',
        email: target.email,
        role: demoRole
      };
      onAuthSuccess(fallbackUser);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative border border-zinc-100 overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-6">
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">
              {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="text-zinc-500 text-xs mt-1">
              {mode === 'login' 
                ? 'Sign in to access your role-specific SwiftRescue dashboard.' 
                : 'Join SwiftRescue emergency dispatch & healthcare network.'}
            </p>
          </div>

          {/* Quick 1-Click Demo Accounts */}
          <div className="mb-6 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200/80">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-2">
              ⚡ 1-Click Quick Demo Login:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('user')}
                className="flex items-center gap-1.5 p-2 bg-white rounded-xl border border-zinc-200 hover:border-red-500 hover:bg-red-50 text-[11px] font-bold text-zinc-800 transition-all text-left"
              >
                <User className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                <span className="truncate">Citizen User</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('driver')}
                className="flex items-center gap-1.5 p-2 bg-white rounded-xl border border-zinc-200 hover:border-amber-500 hover:bg-amber-50 text-[11px] font-bold text-zinc-800 transition-all text-left"
              >
                <Truck className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span className="truncate">Ambulance Driver</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="flex items-center gap-1.5 p-2 bg-white rounded-xl border border-zinc-200 hover:border-indigo-500 hover:bg-indigo-50 text-[11px] font-bold text-zinc-800 transition-all text-left"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                <span className="truncate">HQ Administrator</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('doctor')}
                className="flex items-center gap-1.5 p-2 bg-white rounded-xl border border-zinc-200 hover:border-blue-500 hover:bg-blue-50 text-[11px] font-bold text-zinc-800 transition-all text-left"
              >
                <Stethoscope className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <span className="truncate">Doctor Specialist</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@swiftrescue.org"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none font-medium"
                >
                  <option value="user">Citizen / Patient</option>
                  <option value="driver">Ambulance Driver</option>
                  <option value="doctor">Medical Doctor</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 mt-2"
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-zinc-500">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-red-600 hover:underline"
                >
                  Register here
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-red-600 hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

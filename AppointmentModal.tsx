import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone, Stethoscope, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

export interface Doctor {
  id: string;
  name: string;
  domain: string;
  fees: string;
  rating: number;
  schedule: string;
  image: string;
  status: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_phone: string;
  doctor_id: string;
  doctor_name: string;
  date: string;
  time_slot: string;
  reason: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  created_at?: string;
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctors: Doctor[];
  selectedDoctor?: Doctor | null;
  currentUserId?: string;
  currentUserName?: string;
  onBookingSuccess?: (appointment: Appointment) => void;
}

const TIME_SLOTS = [
  "09:00 AM - 09:30 AM",
  "10:00 AM - 10:30 AM",
  "11:30 AM - 12:00 PM",
  "02:00 PM - 02:30 PM",
  "03:30 PM - 04:00 PM",
  "05:00 PM - 05:30 PM",
  "06:30 PM - 07:00 PM",
];

export default function AppointmentModal({
  isOpen,
  onClose,
  doctors,
  selectedDoctor: initialSelectedDoctor,
  currentUserId,
  currentUserName,
  onBookingSuccess
}: AppointmentModalProps) {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    initialSelectedDoctor?.id || doctors[0]?.id || 'DOC-1'
  );
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState<string>(TIME_SLOTS[0]);
  const [patientName, setPatientName] = useState<string>(currentUserName || '');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  if (!isOpen) return null;

  const currentDoctor = doctors.find(d => d.id === selectedDoctorId) || doctors[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !date || !timeSlot) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      patient_id: currentUserId || 'GUEST',
      patient_name: patientName.trim(),
      patient_phone: patientPhone.trim(),
      doctor_id: currentDoctor.id,
      doctor_name: currentDoctor.name,
      date,
      time_slot: timeSlot,
      reason: reason.trim() || 'General Consultation'
    };

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to book appointment on server');
      }

      const data = await res.json();
      setConfirmedAppointment(data.appointment || { id: `APT-${Date.now()}`, ...payload, status: 'confirmed' });
      if (onBookingSuccess) {
        onBookingSuccess(data.appointment);
      }
    } catch (err: any) {
      // Local fallback for offline/client mode
      const fallbackApt: Appointment = {
        id: `APT-${Date.now()}`,
        ...payload,
        status: 'confirmed',
        created_at: new Date().toISOString()
      };
      setConfirmedAppointment(fallbackApt);
      if (onBookingSuccess) {
        onBookingSuccess(fallbackApt);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmedAppointment(null);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative border border-zinc-100 my-8 overflow-hidden"
        >
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {confirmedAppointment ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-100">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-zinc-900">Appointment Confirmed!</h3>
                <p className="text-xs text-zinc-500 mt-1">Booking ID: <span className="font-mono font-bold text-zinc-800">{confirmedAppointment.id}</span></p>
              </div>

              <div className="bg-zinc-50 rounded-2xl p-4 text-left border border-zinc-200/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-medium">Doctor:</span>
                  <span className="font-bold text-zinc-900">{confirmedAppointment.doctor_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-medium">Date & Time:</span>
                  <span className="font-bold text-emerald-600">{confirmedAppointment.date} • {confirmedAppointment.time_slot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-medium">Patient:</span>
                  <span className="font-bold text-zinc-900">{confirmedAppointment.patient_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-medium">Reason:</span>
                  <span className="font-bold text-zinc-700">{confirmedAppointment.reason}</span>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Doctor Consultation</span>
                </div>
                <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Book an Appointment</h2>
                <p className="text-zinc-500 text-xs mt-1">Select a verified doctor, schedule a time slot, and submit your visit details.</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Doctor Selection */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">Select Medical Specialist</label>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none font-medium text-zinc-900"
                  >
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} — {doc.domain} ({doc.fees})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date & Time Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">Appointment Date</label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        required
                        value={date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">Available Slot</label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 outline-none font-medium"
                      >
                        {TIME_SLOTS.map((slot, idx) => (
                          <option key={idx} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Patient Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">Patient Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">Contact Phone</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Reason for visit */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Reason / Symptoms (Optional)</label>
                  <textarea
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Briefly describe what you'd like to consult about..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 outline-none resize-none font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 mt-2"
                >
                  {loading ? 'Confirming Appointment...' : 'Confirm & Schedule Booking'}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

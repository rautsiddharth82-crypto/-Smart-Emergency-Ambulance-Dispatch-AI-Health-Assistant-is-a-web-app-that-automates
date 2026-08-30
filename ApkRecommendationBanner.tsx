import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ApkRecommendationBannerProps {
  onOpenDownloadModal: () => void;
  deferredPrompt?: any;
}

export default function ApkRecommendationBanner({
  onOpenDownloadModal,
  deferredPrompt
}: ApkRecommendationBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user previously dismissed banner in this session
    const isDismissed = sessionStorage.getItem('swiftrescue_apk_banner_dismissed');
    if (!isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1200); // Trigger 1.2 seconds after landing
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('swiftrescue_apk_banner_dismissed', 'true');
  };

  const handleAction = () => {
    onOpenDownloadModal();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed bottom-20 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 z-[4500] max-w-md bg-zinc-900/95 text-white backdrop-blur-lg p-4 sm:p-5 rounded-3xl shadow-2xl border border-white/15 overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600/30 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start gap-3.5 relative z-10">
          {/* App Icon */}
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-red-500/30 flex-shrink-0">
            <Smartphone className="w-5 h-5 animate-bounce" />
          </div>

          {/* Text Content */}
          <div className="flex-1 pr-6">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="bg-red-500/20 text-red-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-red-500/30">
                Recommended
              </span>
              <span className="text-[10px] text-zinc-400 font-bold">• Android App</span>
            </div>
            <h4 className="font-black text-sm text-white tracking-tight leading-snug">
              Download SwiftRescue APK
            </h4>
            <p className="text-zinc-300 text-xs mt-0.5 leading-relaxed">
              Get instant 1-Click SOS dispatch, offline Ayurvedic AI triage, and live telemetry on your phone.
            </p>

            {/* Buttons */}
            <div className="flex items-center gap-2.5 mt-3">
              <button
                onClick={handleAction}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-black shadow-md shadow-red-600/30 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download APK (8.4 MB)</span>
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-zinc-400 hover:text-white text-xs font-bold transition-colors"
              >
                Later
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-0 right-0 p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

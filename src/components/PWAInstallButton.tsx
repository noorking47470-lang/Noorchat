import React, { useState } from 'react';
import { Download, Smartphone, X, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const handleAction = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'manual') {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      {/* Header Install Button */}
      <button
        id="btn-pwa-install-header"
        onClick={handleAction}
        className={`px-2.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer ${
          isInstalled
            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/40 active:scale-95'
        }`}
        title={isInstalled ? 'Noor Chat is Installed' : 'Install Noor Chat as Android App'}
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline">
          {isInstalled ? 'Installed' : 'Install App'}
        </span>
        <span className="sm:hidden">Install</span>
      </button>

      {/* Floating Bottom Quick Install Banner for First-Time Mobile Visitors */}
      {!isInstalled && !bannerDismissed && (
        <div className="fixed bottom-16 left-3 right-3 sm:left-auto sm:right-4 sm:w-96 z-40 bg-slate-900/95 backdrop-blur-md border border-emerald-500/50 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src="/pwa-192x192.png"
                alt="Noor Chat"
                className="w-9 h-9 rounded-xl object-cover border border-emerald-500/30"
              />
              <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-emerald-500 text-slate-950">
                <Sparkles className="w-2.5 h-2.5" />
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">Install Noor Chat</p>
              <p className="text-[10px] text-slate-400 truncate">
                Add to Android home screen for full experience
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id="btn-banner-install"
              onClick={handleAction}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow transition active:scale-95 cursor-pointer"
            >
              Install
            </button>
            <button
              id="btn-dismiss-banner"
              onClick={() => setBannerDismissed(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Comprehensive Install & Deployment Modal */}
      {showModal && <PWAInstallModal onClose={() => setShowModal(false)} />}
    </>
  );
};

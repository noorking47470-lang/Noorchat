import React, { useState } from 'react';
import {
  Download,
  X,
  Smartphone,
  CheckCircle2,
  Share2,
  Copy,
  ExternalLink,
  Globe,
  Sparkles,
  ShieldCheck,
  MoreVertical,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'deploy' | 'ios'>(
    isIOS ? 'ios' : 'android'
  );

  // Determine current public URL
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      await install();
    } finally {
      setInstalling(false);
    }
  };

  const handleCopyUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 my-auto">
        {/* Close Button */}
        <button
          id="btn-close-pwa-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* App Header Showcase */}
        <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-800">
          <div className="relative shrink-0">
            <img
              src="/pwa-192x192.png"
              alt="Noor Chat Icon"
              className="w-16 h-16 rounded-2xl shadow-xl border border-emerald-500/40 object-cover"
            />
            <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-slate-950">
              <Sparkles className="w-3 h-3" />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Noor Chat</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                PWA
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Modern Android Messaging • WebRTC Audio & Video • Polls
            </p>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-emerald-400/90 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Full Android Chrome Installable</span>
            </div>
          </div>
        </div>

        {/* Primary Action Button (Chrome Native Prompt or Installed Status) */}
        <div className="mb-5">
          {isInstalled ? (
            <div className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Noor Chat is installed and running in standalone mode!</span>
            </div>
          ) : isInstallable ? (
            <button
              id="btn-trigger-chrome-install"
              onClick={handleInstallClick}
              disabled={installing}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-emerald-950/50 transition cursor-pointer active:scale-98"
            >
              <Download className="w-5 h-5" />
              <span>{installing ? 'Opening Chrome Dialog...' : 'Install App to Android Home Screen'}</span>
            </button>
          ) : (
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">Direct Android Chrome Install</p>
                  <p className="text-[11px] text-slate-400">Follow the 2-step guide below</p>
                </div>
              </div>
              <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
                Chrome Ready
              </span>
            </div>
          )}
        </div>

        {/* Navigation Tabs for Instructions & Deployment */}
        <div className="flex rounded-xl bg-slate-950 p-1 mb-4 border border-slate-800">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'android'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📱 Android (Chrome)
          </button>
          <button
            onClick={() => setActiveTab('deploy')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'deploy'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🌐 Public URL & Deploy
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'ios'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🍏 iOS Safari
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'android' && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-300 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <span>Install on Android using Google Chrome</span>
            </h4>
            <ol className="space-y-2.5 list-decimal list-inside pl-1 text-slate-300">
              <li>
                Open this app in <strong>Google Chrome</strong> on your Android phone.
              </li>
              <li>
                Tap the <strong>three dots menu icon</strong> (<MoreVertical className="w-3.5 h-3.5 inline text-emerald-400" />) in the top-right corner of Chrome.
              </li>
              <li>
                Tap <strong>&ldquo;Install app&rdquo;</strong> (or <strong>&ldquo;Add to Home screen&rdquo;</strong>).
              </li>
              <li>
                Tap <strong>&ldquo;Install&rdquo;</strong> on the native prompt. Noor Chat will be added to your phone&apos;s home screen and app drawer with the custom Noor Chat icon, offline service worker, and full-screen Android interface without browser bars!
              </li>
            </ol>
            <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>
                <strong>Tip:</strong> If you are testing inside an iframe, open the app in a new browser tab first so Chrome can display its native installation sheet.
              </span>
            </div>
          </div>
        )}

        {activeTab === 'deploy' && (
          <div className="space-y-3.5 text-xs text-slate-300 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <div>
              <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Your App URLs & Public Access</span>
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Noor Chat is hosted on Google Cloud Run with HTTPS, meeting all Progressive Web App security requirements.
              </p>
            </div>

            {/* Current URL Box */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-700">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Current App URL</span>
                <span className="text-[10px] text-emerald-400 font-semibold">HTTPS Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="flex-1 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-200 font-mono truncate"
                />
                <button
                  onClick={handleCopyUrl}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 transition"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Deployment Steps */}
            <div className="space-y-2 pt-1 border-t border-slate-800">
              <p className="font-bold text-white text-xs">How to get a permanent public link to share:</p>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span>
                    Click the <strong>Share</strong> button in the top right menu of AI Studio.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>
                    Toggle <strong>&ldquo;Publish&rdquo;</strong> to generate a permanent shared preview link.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span>
                    Send the link to any Android phone via WhatsApp, Telegram, or SMS. When friends tap the link, Chrome will prompt them to install Noor Chat!
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ios' && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-300 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <h4 className="font-bold text-white text-sm">Install on iPhone / iPad (Safari)</h4>
            <p className="text-[11px] text-slate-400">
              Apple iOS requires installing through Safari&apos;s Share menu:
            </p>
            <ol className="space-y-2 list-decimal list-inside pl-1 text-slate-300">
              <li>Open this page in <strong>Safari</strong> on your iPhone or iPad.</li>
              <li>Tap the <strong>Share</strong> icon (<Share2 className="w-3.5 h-3.5 inline text-emerald-400" />) at the bottom toolbar.</li>
              <li>Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>.</li>
              <li>Tap <strong>&ldquo;Add&rdquo;</strong> in the top-right corner.</li>
            </ol>
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between text-[11px] text-slate-400">
          <span>Manifest v2.0 • Service Worker Active</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

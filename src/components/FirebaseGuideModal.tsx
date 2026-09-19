import React, { useState } from 'react';
import { X, Flame, Smartphone, Copy, Check, ShieldCheck, Terminal, Download, FileCode, Globe, Sparkles } from 'lucide-react';

interface FirebaseGuideModalProps {
  onClose: () => void;
}

export const FirebaseGuideModal: React.FC<FirebaseGuideModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk' | 'firebase' | 'manifest'>('pwa');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const CAPACITOR_CONFIG = `{
  "appId": "app.noor.chat",
  "appName": "Noor Chat",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https"
  },
  "android": {
    "allowMixedContent": true
  }
}`;

  const ANDROID_MANIFEST_SNIPPET = `<!-- Add to android/app/src/main/AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="app.noor.chat">

    <!-- Noor Chat Audio, Video, and Media Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Noor Chat"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">
        <!-- Main Activity -->
    </application>
</manifest>`;

  const FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Default Deny Catch-All
    match /{document=**} {
      allow read, write: if false;
    }

    function isSignedIn() {
      return request.auth != null;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn();
      allow write: if isSignedIn() && request.auth.uid == userId;
    }

    // 1-to-1 Messages
    match /messages/{messageId} {
      allow read: if isSignedIn() && (
        resource.data.senderId == request.auth.uid ||
        resource.data.recipientId == request.auth.uid
      );
      allow create: if isSignedIn() && request.resource.data.senderId == request.auth.uid;
      allow update: if isSignedIn() && (
        resource.data.recipientId == request.auth.uid ||
        resource.data.senderId == request.auth.uid
      );
    }

    // Private 10-Member Groups
    match /groups/{groupId} {
      allow read: if isSignedIn() && resource.data.members.size() <= 10;
      allow create: if isSignedIn() && request.resource.data.members.size() <= 10;
      allow update: if isSignedIn() && request.resource.data.members.size() <= 10;
    }
  }
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-emerald-500/30 p-5 sm:p-6 shadow-2xl text-slate-100 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Android APK & Firebase Setup</h3>
              <p className="text-[11px] text-slate-400">Production Build & Deployment Guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-4 gap-1 my-3 p-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`py-2 rounded-lg transition flex items-center justify-center gap-1 ${
              activeTab === 'pwa'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>PWA & Deploy</span>
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`py-2 rounded-lg transition flex items-center justify-center gap-1 ${
              activeTab === 'apk'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Build APK</span>
          </button>
          <button
            onClick={() => setActiveTab('firebase')}
            className={`py-2 rounded-lg transition flex items-center justify-center gap-1 ${
              activeTab === 'firebase'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Firebase</span>
          </button>
          <button
            onClick={() => setActiveTab('manifest')}
            className={`py-2 rounded-lg transition flex items-center justify-center gap-1 ${
              activeTab === 'manifest'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-teal-400" />
            <span>Manifest</span>
          </button>
        </div>

        {/* Tab: PWA Installation & Public Deployment */}
        {activeTab === 'pwa' && (
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs text-slate-300">
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200">
              <span className="font-bold text-white">Instant Android Installation:</span> Noor Chat is configured as an official Progressive Web App (PWA) with complete offline caching, high-resolution 192x192 and 512x512 icons, and standalone Android launch capabilities.
            </div>

            {/* Android Chrome 3-Step Guide */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>How to Install on Android from Google Chrome:</span>
              </h4>
              <ol className="space-y-2 list-decimal list-inside pl-1 text-[11px] text-slate-300">
                <li>Open Noor Chat in <strong>Google Chrome</strong> on your Android phone.</li>
                <li>Tap the <strong>three dots (⋮)</strong> menu in the upper-right corner of Chrome.</li>
                <li>Select <strong>&ldquo;Install app&rdquo;</strong> (or <strong>&ldquo;Add to Home screen&rdquo;</strong>).</li>
                <li>Tap <strong>&ldquo;Install&rdquo;</strong>. Noor Chat will be installed directly to your phone&apos;s home screen and app launcher with its custom Noor icon and splash screen.</li>
              </ol>
            </div>

            {/* Public Deployment & Sharing */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-teal-400" />
                  <span>Public URL & Cloud Deployment:</span>
                </h4>
                <button
                  onClick={() => copyToClipboard(currentUrl, 'pwaUrl')}
                  className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300"
                >
                  {copiedSection === 'pwaUrl' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'pwaUrl' ? 'Copied' : 'Copy URL'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Your app is served through Cloud Run with SSL HTTPS. Anyone opening this link on Android can install it immediately:
              </p>
              <div className="p-2 bg-slate-900 rounded-lg text-slate-200 font-mono text-[10px] break-all border border-slate-800">
                {currentUrl}
              </div>
              <div className="space-y-1 text-[11px] text-slate-400 pt-1">
                <p>• <strong>AI Studio Share Link:</strong> Click <strong>Share</strong> in AI Studio &gt; toggle <strong>Publish</strong> to generate a permanent shared URL.</p>
                <p>• <strong>Cloud Run Deploy:</strong> Use the Settings menu to deploy a dedicated custom domain instance anytime.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Build Android APK */}
        {activeTab === 'apk' && (
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs text-slate-300">
            {/* Status Card */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-white text-sm">Capacitor Android Project Ready!</span>
              </div>
              <p className="text-[11px] text-emerald-300/90 leading-relaxed">
                Your project now includes the official <strong>Capacitor Android configuration</strong>, the <strong>android/</strong> native project folder, and custom <strong>Noor Chat mipmap app icons</strong>.
              </p>
            </div>

            {/* Step 1: Exporting from AI Studio */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <h4 className="font-bold text-white text-xs">Export Complete Project from AI Studio</h4>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed pl-7">
                In Google AI Studio, click the <strong>Settings (gear icon)</strong> or the top-right menu and choose <strong>&ldquo;Export to ZIP&rdquo;</strong> (or export to GitHub). Extract the downloaded ZIP file on your computer.
              </p>
            </div>

            {/* Step 2: Open in Android Studio */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </span>
                  <h4 className="font-bold text-white text-xs">Open in Android Studio</h4>
                </div>
                <button
                  onClick={() => copyToClipboard('npx cap open android', 'openCap')}
                  className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300"
                >
                  {copiedSection === 'openCap' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'openCap' ? 'Copied' : 'Copy command'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed pl-7">
                Download free <strong>Android Studio</strong> (from developer.android.com). Click <strong>Open</strong> and select the <strong>&ldquo;android&rdquo;</strong> folder inside your extracted project. Alternatively, in your computer terminal run:
              </p>
              <pre className="ml-7 p-2 rounded-xl bg-black/60 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                npx cap open android
              </pre>
              <p className="text-[10px] text-slate-400 pl-7">
                Android Studio will automatically open and sync the Gradle build files.
              </p>
            </div>

            {/* Step 3: Generating Signed APK */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <h4 className="font-bold text-white text-xs">Generate Signed Release APK (for Friends)</h4>
              </div>
              <p className="text-[11px] text-slate-300 pl-7">
                Follow these simple clicks in Android Studio:
              </p>
              <ol className="list-decimal list-inside pl-7 space-y-1.5 text-[11px] text-slate-300">
                <li>In top menu: Click <strong>Build &gt; Generate Signed Bundle / APK...</strong></li>
                <li>Choose <strong>APK</strong> &gt; Click <strong>Next</strong>.</li>
                <li>Under Key store path, click <strong>&ldquo;Create new...&rdquo;</strong>, choose a folder, and set a simple password (e.g. <code className="text-emerald-400">noorchat123</code>). Fill in your name &gt; Click <strong>OK</strong>.</li>
                <li>Choose destination folder &gt; Select build type <strong>&ldquo;release&rdquo;</strong> &gt; Check both signature boxes (<strong>V1 Jar</strong> and <strong>V2 Full APK</strong>) &gt; Click <strong>Create</strong>.</li>
                <li>Android Studio will notify: <em>&ldquo;APK(s) generated successfully&rdquo;</em>. Click <strong>&ldquo;locate&rdquo;</strong> to open the folder with your <code className="text-emerald-300 font-bold">app-release.apk</code> file!</li>
              </ol>
              <div className="ml-7 p-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                <strong>Quick Alternative (Debug APK):</strong> You can also simply click <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong> to get <code className="text-emerald-300">app-debug.apk</code> instantly without creating a keystore.
              </div>
            </div>

            {/* Step 4: Sharing via WhatsApp with 10 Friends */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  4
                </span>
                <h4 className="font-bold text-white text-xs">Share the APK via WhatsApp to Your Friends</h4>
              </div>
              <p className="text-[11px] text-slate-300 pl-7">
                How to send the APK file directly to your 10 friends or WhatsApp group:
              </p>
              <ol className="list-decimal list-inside pl-7 space-y-1.5 text-[11px] text-slate-300">
                <li>Open <strong>WhatsApp</strong> (or WhatsApp Web on your computer).</li>
                <li>Open your chat or group with your friends.</li>
                <li>Tap the <strong>Paperclip (📎)</strong> attachment icon &gt; Choose <strong>&ldquo;Document&rdquo;</strong> (do NOT choose Gallery/Photos).</li>
                <li>Select the <strong className="text-emerald-400">app-release.apk</strong> file and tap <strong>Send</strong>.</li>
                <li>
                  <strong>Tell your friends:</strong> When they tap the file in WhatsApp, Android will show <em>&ldquo;For your security, your phone is not allowed to install unknown apps from this source&rdquo;</em>. They simply tap <strong>Settings &gt; Allow from this source &gt; Install</strong>. Noor Chat will open and run with its custom icon!
                </li>
              </ol>
            </div>

            {/* Instant Option: Public Web Link */}
            <div className="p-3 rounded-2xl bg-teal-950/40 border border-teal-500/30 text-[11px] text-teal-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Instant WhatsApp Link Alternative:</strong> You can also copy your app link (<span className="font-mono text-white text-[10px]">{currentUrl}</span>) and send it directly in WhatsApp. Your friends can tap the link on Android Chrome and click <strong>&ldquo;Install App&rdquo;</strong> without any APK file transfer!
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Firebase Setup */}
        {activeTab === 'firebase' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs text-slate-300">
            <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200">
              <span className="font-bold text-white">Firebase Backend Integration:</span> Provides cloud database sync, Google/Email Auth, and Firebase Cloud Messaging (FCM) notifications on Android.
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-white mb-1">1. Create Project & Add Android App</h4>
                <p className="text-slate-400 text-[11px] mb-2">
                  Go to <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline">console.firebase.google.com</a> &gt; Add project &gt; Add Android App with package name <code className="text-emerald-300">app.noor.chat</code>.
                </p>
                <p className="text-slate-400 text-[11px]">
                  Download <code className="text-amber-300">google-services.json</code> and place it inside <code className="text-slate-200">android/app/</code>.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-bold text-white">2. Hardened Cloud Firestore Rules</h4>
                  <button
                    onClick={() => copyToClipboard(FIRESTORE_RULES, 'rules')}
                    className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300"
                  >
                    {copiedSection === 'rules' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'rules' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-2.5 rounded-xl bg-black/60 font-mono text-[10px] text-emerald-300 max-h-40 overflow-y-auto">
                  {FIRESTORE_RULES}
                </pre>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-white mb-1">3. Push Notifications (FCM)</h4>
                <p className="text-slate-400 text-[11px]">
                  Install <code className="text-emerald-300">@capacitor/push-notifications</code> to receive native Android notifications even when Noor Chat is in background or device is locked.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Permissions & Config */}
        {activeTab === 'manifest' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs text-slate-300">
            <div className="p-3 rounded-2xl bg-teal-950/40 border border-teal-500/30 text-teal-200">
              <span className="font-bold text-white">Native Android Manifest:</span> Crucial permissions for Camera, Microphone, and Audio Calls.
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="font-bold text-white">AndroidManifest.xml</h4>
                <button
                  onClick={() => copyToClipboard(ANDROID_MANIFEST_SNIPPET, 'manifest')}
                  className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300"
                >
                  {copiedSection === 'manifest' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'manifest' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-2.5 rounded-xl bg-black/60 font-mono text-[10px] text-teal-300 max-h-48 overflow-y-auto">
                {ANDROID_MANIFEST_SNIPPET}
              </pre>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="font-bold text-white">capacitor.config.json</h4>
                <button
                  onClick={() => copyToClipboard(CAPACITOR_CONFIG, 'capconfig')}
                  className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300"
                >
                  {copiedSection === 'capconfig' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'capconfig' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-2.5 rounded-xl bg-black/60 font-mono text-[10px] text-teal-300 overflow-x-auto">
                {CAPACITOR_CONFIG}
              </pre>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-slate-500">Package ID: app.noor.chat</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

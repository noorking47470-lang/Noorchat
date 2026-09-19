import React, { useState, useEffect, useRef } from 'react';
import { User, CallType, CallStatus } from '../types';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, VolumeX, RefreshCw, Shield, Sparkles } from 'lucide-react';
import { startRingtone, stopRingtone } from '../utils/audio';

interface CallScreenProps {
  peer: User;
  type: CallType;
  isIncoming: boolean;
  onEndCall: (durationSeconds: number) => void;
  onAcceptIncoming?: () => void;
}

export const CallScreen: React.FC<CallScreenProps> = ({
  peer,
  type,
  isIncoming,
  onEndCall,
  onAcceptIncoming,
}) => {
  const [status, setStatus] = useState<CallStatus>(isIncoming ? 'ringing' : 'ringing');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(type === 'audio');
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [hasMediaPermission, setHasMediaPermission] = useState<boolean | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Handle call ringing & connected state
  useEffect(() => {
    if (status === 'ringing') {
      startRingtone(isIncoming ? 'incoming' : 'outgoing');
      // If outgoing, auto-connect after 3.2 seconds
      if (!isIncoming) {
        const timer = setTimeout(() => {
          stopRingtone();
          setStatus('connected');
        }, 3200);
        return () => {
          clearTimeout(timer);
          stopRingtone();
        };
      }
    } else if (status === 'connected') {
      stopRingtone();
      const timer = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, isIncoming]);

  // Request actual camera / microphone stream
  useEffect(() => {
    let active = true;

    async function initMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: type === 'video' ? { facingMode } : false,
          audio: true,
        });

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = stream;
        setHasMediaPermission(true);

        if (localVideoRef.current && type === 'video') {
          localVideoRef.current.srcObject = stream;
        }

        // Set up real AudioContext Analyser for visualizer
        try {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          const audioCtx = new AudioContextClass();
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const drawVisualizer = () => {
            if (!active) return;
            animationFrameRef.current = requestAnimationFrame(drawVisualizer);
            analyser.getByteFrequencyData(dataArray);

            const canvas = canvasRef.current;
            if (canvas) {
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const barWidth = (canvas.width / bufferLength) * 1.5;
                let x = 0;
                for (let i = 0; i < bufferLength; i++) {
                  const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
                  const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
                  gradient.addColorStop(0, '#10b981');
                  gradient.addColorStop(1, '#fbbf24');
                  ctx.fillStyle = gradient;
                  ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
                  x += barWidth;
                }
              }
            }
          };
          drawVisualizer();
        } catch (e) {
          console.warn('Analyser setup error:', e);
        }
      } catch (err) {
        console.warn('getUserMedia error (permission denied or no device):', err);
        setHasMediaPermission(false);
      }
    }

    initMedia();

    return () => {
      active = false;
      stopRingtone();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [type, facingMode]);

  // Toggle Mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
    setIsMuted(!isMuted);
  };

  // Toggle Video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
    setIsVideoOff(!isVideoOff);
  };

  // Flip Camera
  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleEnd = () => {
    stopRingtone();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    onEndCall(duration);
  };

  const handleAccept = () => {
    stopRingtone();
    setStatus('connected');
    if (onAcceptIncoming) onAcceptIncoming();
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-gradient-to-b from-slate-950 via-teal-950 to-slate-950 text-white overflow-hidden select-none animate-fadeIn">
      {/* Top Bar with Call Info */}
      <div className="relative z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
            {type === 'video' ? 'Noor HD Video Call' : 'Noor Voice Call'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-300 text-xs px-2.5 py-1 rounded-full bg-slate-900/60 border border-slate-700/50">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>E2E Encrypted</span>
        </div>
      </div>

      {/* Main Video or Audio Stage */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-6">
        {type === 'video' ? (
          <div className="relative w-full h-full max-h-[560px] rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center">
            {/* Remote Simulated Video Feed with Ambient Animated Glow */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950">
              <div className="relative">
                <img
                  src={peer.avatar}
                  alt={peer.name}
                  className="w-32 h-32 rounded-full object-cover ring-4 ring-emerald-500/40 shadow-2xl animate-pulse"
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900/90 border border-emerald-500/40 text-[11px] font-semibold text-emerald-300 flex items-center gap-1 whitespace-nowrap">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Remote Stream (1080p)
                </div>
              </div>
            </div>

            {/* Local Video Camera PIP (Picture-In-Picture) */}
            <div className="absolute bottom-4 right-4 w-32 h-44 rounded-2xl overflow-hidden bg-black/90 border-2 border-emerald-500/60 shadow-2xl z-30">
              {hasMediaPermission && !isVideoOff ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-slate-900 text-slate-400 text-center">
                  <VideoOff className="w-6 h-6 text-slate-500 mb-1" />
                  <span className="text-[10px]">Camera Off</span>
                </div>
              )}
              <span className="absolute bottom-1 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-white">
                You
              </span>
            </div>
          </div>
        ) : (
          /* Audio Call Visualizer Stage */
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative">
              {/* Pulsing glow ripples */}
              <div className="absolute -inset-4 rounded-full bg-emerald-500/20 blur-xl animate-ping" />
              <div className="absolute -inset-8 rounded-full bg-teal-500/10 blur-2xl" />

              <img
                src={peer.avatar}
                alt={peer.name}
                className="relative w-36 h-36 rounded-full object-cover ring-4 ring-emerald-500/50 shadow-2xl"
              />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{peer.name}</h2>
              <p className="text-sm text-emerald-400 font-medium mt-1">@{peer.username}</p>
              <p className="text-xs text-slate-400 mt-2">
                {status === 'ringing'
                  ? isIncoming
                    ? 'Incoming Noor Call...'
                    : 'Calling Noor Network...'
                  : formatDuration(duration)}
              </p>
            </div>

            {/* Live Audio Frequency Canvas */}
            {status === 'connected' && (
              <div className="w-64 h-14 bg-slate-900/60 border border-slate-800 rounded-2xl p-2 flex items-center justify-center shadow-inner">
                <canvas ref={canvasRef} width={220} height={40} className="w-full h-full" />
              </div>
            )}
          </div>
        )}

        {/* Call status banner for video calls */}
        {type === 'video' && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-slate-700/60 text-xs text-slate-200">
            {status === 'ringing'
              ? isIncoming
                ? 'Incoming Video Call...'
                : 'Calling...'
              : `Connected • ${formatDuration(duration)}`}
          </div>
        )}
      </div>

      {/* Bottom Call Controls */}
      <div className="relative z-30 p-6 pb-8 bg-gradient-to-t from-black/90 via-slate-950/80 to-transparent">
        {status === 'ringing' && isIncoming ? (
          /* Incoming Call Actions: Decline or Accept */
          <div className="flex items-center justify-around max-w-xs mx-auto">
            <button
              id="btn-decline-call"
              onClick={handleEnd}
              className="flex flex-col items-center gap-1.5 text-rose-400 hover:text-rose-300 transition cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center text-white shadow-xl shadow-rose-900/40 active:scale-95 transition">
                <PhoneOff className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold">Decline</span>
            </button>

            <button
              id="btn-accept-call"
              onClick={handleAccept}
              className="flex flex-col items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition cursor-pointer animate-bounce"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-900/40 active:scale-95 transition">
                <Video className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold">Accept</span>
            </button>
          </div>
        ) : (
          /* Connected Call Controls: Mute, Video, Speaker, Flip, End */
          <div className="flex items-center justify-center gap-4 max-w-sm mx-auto">
            {/* Mute Button */}
            <button
              id="btn-toggle-mute"
              onClick={toggleMute}
              className={`p-3.5 rounded-full transition shadow-lg cursor-pointer ${
                isMuted
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800/90 text-slate-200 hover:bg-slate-700'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Video Toggle Button (for video calls) */}
            {type === 'video' && (
              <button
                id="btn-toggle-video"
                onClick={toggleVideo}
                className={`p-3.5 rounded-full transition shadow-lg cursor-pointer ${
                  isVideoOff
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800/90 text-slate-200 hover:bg-slate-700'
                }`}
                title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
            )}

            {/* Flip Camera Button */}
            {type === 'video' && (
              <button
                id="btn-flip-camera"
                onClick={flipCamera}
                className="p-3.5 rounded-full bg-slate-800/90 text-slate-200 hover:bg-slate-700 transition shadow-lg cursor-pointer"
                title="Flip Camera"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            )}

            {/* Speaker Toggle */}
            <button
              id="btn-toggle-speaker"
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`p-3.5 rounded-full transition shadow-lg cursor-pointer ${
                !isSpeakerOn
                  ? 'bg-slate-800 text-slate-500'
                  : 'bg-slate-800/90 text-slate-200 hover:bg-slate-700'
              }`}
              title={isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
            >
              {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* End Call Button */}
            <button
              id="btn-end-call"
              onClick={handleEnd}
              className="p-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-950/60 active:scale-95 transition cursor-pointer"
              title="End Call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

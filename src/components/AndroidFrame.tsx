import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Smartphone, Maximize2, Minimize2 } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  activeScreenTitle?: string;
  isDeviceMode: boolean;
  onToggleDeviceMode: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  isDeviceMode,
  onToggleDeviceMode,
}) => {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    update();
    const timer = setInterval(update, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
      {/* Top Floating Utility Control Bar */}
      <div className="absolute top-2.5 z-50 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/60 shadow-xl text-xs text-slate-300">
        <span className="flex items-center gap-1.5 font-medium text-emerald-400">
          <Smartphone className="w-3.5 h-3.5" />
          Noor Chat Android Edition
        </span>
        <div className="w-px h-3.5 bg-slate-700 mx-1" />
        <button
          id="btn-toggle-device-frame"
          onClick={onToggleDeviceMode}
          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer px-2 py-0.5 rounded-md hover:bg-slate-800"
          title={isDeviceMode ? 'Switch to Full-Screen View' : 'Switch to Android Device Frame'}
        >
          {isDeviceMode ? (
            <>
              <Maximize2 className="w-3 h-3 text-emerald-400" />
              <span>Full Screen</span>
            </>
          ) : (
            <>
              <Minimize2 className="w-3 h-3 text-amber-400" />
              <span>Phone Frame</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container: Either Framed or Fullscreen */}
      <div
        className={`relative flex flex-col transition-all duration-300 overflow-hidden ${
          isDeviceMode
            ? 'w-full max-w-[412px] h-[92vh] max-h-[892px] rounded-[44px] border-[10px] border-slate-900 shadow-2xl shadow-emerald-950/40 ring-1 ring-slate-800/80 bg-slate-950'
            : 'w-full h-full max-w-none rounded-none border-0 bg-slate-950'
        }`}
      >
        {/* Android Status Bar */}
        <div className="relative shrink-0 h-10 w-full bg-slate-950/95 backdrop-blur-md z-40 flex items-center justify-between px-6 select-none border-b border-slate-900/50">
          {/* Time */}
          <span className="text-xs font-semibold text-slate-200 tracking-wide">
            {currentTime || '12:00'}
          </span>

          {/* Center Front Camera Hole Punch */}
          <div className="absolute left-1/2 -translate-x-1/2 top-2 w-3.5 h-3.5 rounded-full bg-black border border-slate-800 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-950/80" />
          </div>

          {/* Status Icons */}
          <div className="flex items-center gap-2 text-slate-300 text-[11px] font-medium">
            <span className="text-[10px] font-bold text-emerald-400 tracking-tight">5G</span>
            <Wifi className="w-3.5 h-3.5 text-slate-300" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px]">98%</span>
              <BatteryMedium className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative flex-1 flex flex-col min-h-0 w-full overflow-hidden bg-slate-950">
          {children}
        </div>

        {/* Android Gesture Bar */}
        <div className="shrink-0 h-5 w-full bg-slate-950 flex items-center justify-center z-40">
          <div className="w-32 h-1 rounded-full bg-slate-700/80 hover:bg-slate-500 transition-colors cursor-pointer" />
        </div>
      </div>
    </div>
  );
};

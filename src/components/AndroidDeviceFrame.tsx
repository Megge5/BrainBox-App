import React from 'react';
import { AndroidStatusBar } from './AndroidStatusBar';
import { AndroidNavBar } from './AndroidNavBar';

interface AndroidDeviceFrameProps {
  children: React.ReactNode;
  enabled: boolean;
  darkMode: boolean;
  onBack: () => void;
  onHome: () => void;
}

export const AndroidDeviceFrame: React.FC<AndroidDeviceFrameProps> = ({
  children,
  enabled,
  darkMode,
  onBack,
  onHome,
}) => {
  if (!enabled) {
    return (
      <div
        className={`min-h-screen w-full flex flex-col transition-colors ${
          darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
        }`}
      >
        <div className="w-full max-w-md mx-auto min-h-screen flex flex-col relative shadow-2xl overflow-x-hidden">
          <AndroidStatusBar darkMode={darkMode} />
          <main className="flex-1 flex flex-col">{children}</main>
          <AndroidNavBar onBack={onBack} onHome={onHome} darkMode={darkMode} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center p-2 sm:p-6 transition-colors ${
        darkMode ? 'bg-slate-950' : 'bg-slate-200'
      }`}
    >
      {/* Android Device Mockup Shell */}
      <div className="relative w-full max-w-[410px] h-[850px] max-h-[95vh] rounded-[48px] p-3.5 bg-slate-900 border-[10px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden">
        {/* Android Camera Punch Hole / Speaker */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-950 rounded-full z-40 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-700/50 mr-2" />
          <div className="w-8 h-1 bg-slate-800 rounded-full" />
        </div>

        {/* Screen Content Container */}
        <div
          className={`relative w-full h-full rounded-[36px] overflow-hidden flex flex-col ${
            darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
          }`}
        >
          <AndroidStatusBar darkMode={darkMode} />
          <main className="flex-1 flex flex-col overflow-y-auto relative">{children}</main>
          <AndroidNavBar onBack={onBack} onHome={onHome} darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
};

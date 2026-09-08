import React from 'react';
import { Triangle, Circle, Square } from 'lucide-react';
import { soundFx } from '../utils/sound';

interface AndroidNavBarProps {
  onBack: () => void;
  onHome: () => void;
  darkMode?: boolean;
}

export const AndroidNavBar: React.FC<AndroidNavBarProps> = ({ onBack, onHome, darkMode = true }) => {
  return (
    <div
      className={`w-full py-2.5 px-10 flex items-center justify-around select-none z-30 transition-colors border-t ${
        darkMode
          ? 'bg-slate-950/80 border-slate-800/60 text-slate-400'
          : 'bg-white/90 border-slate-200 text-slate-600'
      }`}
    >
      <button
        id="android-nav-back"
        onClick={() => {
          soundFx.playTap();
          onBack();
        }}
        className="p-2 rounded-full hover:bg-slate-700/20 active:scale-90 transition transform"
        title="Back"
        aria-label="Back"
      >
        <Triangle className="w-4 h-4 -rotate-90 fill-current" />
      </button>

      <button
        id="android-nav-home"
        onClick={() => {
          soundFx.playTap();
          onHome();
        }}
        className="p-2 rounded-full hover:bg-slate-700/20 active:scale-90 transition transform"
        title="Home"
        aria-label="Home"
      >
        <Circle className="w-4 h-4 fill-current" />
      </button>

      <button
        id="android-nav-recent"
        onClick={() => {
          soundFx.playTap();
        }}
        className="p-2 rounded-full hover:bg-slate-700/20 active:scale-90 transition transform"
        title="Overview"
        aria-label="Overview"
      >
        <Square className="w-3.5 h-3.5 fill-current" />
      </button>
    </div>
  );
};

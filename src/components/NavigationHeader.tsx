import React from 'react';
import { ArrowLeft, Volume2, VolumeX, Smartphone, Maximize2 } from 'lucide-react';
import { soundFx } from '../utils/sound';

interface NavigationHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isDeviceFrame?: boolean;
  onToggleDeviceFrame?: () => void;
  darkMode?: boolean;
  rightAction?: React.ReactNode;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  title,
  subtitle,
  onBack,
  showBack = true,
  soundEnabled,
  onToggleSound,
  isDeviceFrame,
  onToggleDeviceFrame,
  darkMode = true,
  rightAction,
}) => {
  return (
    <header
      className={`w-full px-4 py-3 flex items-center justify-between border-b select-none transition-colors ${
        darkMode
          ? 'bg-slate-900/90 border-slate-800 text-slate-100'
          : 'bg-white/95 border-slate-200 text-slate-900'
      }`}
    >
      <div className="flex items-center space-x-3">
        {showBack && onBack ? (
          <button
            id="nav-back-button"
            onClick={() => {
              soundFx.playTap();
              onBack();
            }}
            className={`p-2 rounded-xl active:scale-95 transition ${
              darkMode
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            aria-label="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : null}

        <div>
          <h1 className="font-bold text-lg sm:text-xl tracking-tight leading-tight">{title}</h1>
          {subtitle && (
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {rightAction}

        {onToggleDeviceFrame && (
          <button
            id="nav-toggle-frame"
            onClick={() => {
              soundFx.playTap();
              onToggleDeviceFrame();
            }}
            className={`p-2 rounded-xl transition active:scale-95 ${
              darkMode
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
            title={isDeviceFrame ? 'Switch to Full Screen View' : 'Switch to Android Phone Mockup'}
            aria-label="Toggle Phone Frame"
          >
            {isDeviceFrame ? <Maximize2 className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>
        )}

        <button
          id="nav-toggle-sound"
          onClick={() => {
            soundFx.playTap();
            onToggleSound();
          }}
          className={`p-2 rounded-xl transition active:scale-95 ${
            soundEnabled
              ? 'bg-indigo-600 text-white shadow-sm'
              : darkMode
              ? 'bg-slate-800 text-slate-400'
              : 'bg-slate-200 text-slate-500'
          }`}
          title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          aria-label="Toggle Sound"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Vibrate,
  Moon,
  Sun,
  Gauge,
  RotateCcw,
  Smartphone,
  Maximize2,
  Code2,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { AppSettings, Difficulty } from '../types';
import { soundFx } from '../utils/sound';

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetProgress: () => void;
  onBack: () => void;
  onOpenAndroidCode: () => void;
  darkMode?: boolean;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onResetProgress,
  onBack,
  onOpenAndroidCode,
  darkMode = true,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetDoneNotice, setResetDoneNotice] = useState(false);

  const handleReset = () => {
    soundFx.playTap();
    onResetProgress();
    setShowResetConfirm(false);
    setResetDoneNotice(true);
    setTimeout(() => setResetDoneNotice(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full select-none space-y-4 pb-8 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center space-x-3 pt-1">
        <button
          id="settings-back-btn"
          onClick={() => {
            soundFx.playTap();
            onBack();
          }}
          className={`p-2 rounded-xl active:scale-95 transition ${
            darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-100">Settings</h1>
          <p className="text-xs text-slate-400">Customize audio, gameplay & display</p>
        </div>
      </div>

      {/* Main Settings Panel */}
      <div className="rounded-3xl p-4 bg-slate-900/90 border border-slate-800 shadow-md space-y-4">
        {/* Sound Toggle */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              {settings.sound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-sm font-bold text-slate-200 block">Sound FX</span>
              <span className="text-xs text-slate-400">In-game sound synthesizers and chimes</span>
            </div>
          </div>
          <button
            id="settings-sound-toggle"
            onClick={() => {
              const next = !settings.sound;
              soundFx.setSoundEnabled(next);
              soundFx.playTap();
              onUpdateSettings({ sound: next });
            }}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              settings.sound ? 'bg-indigo-600' : 'bg-slate-750'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.sound ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="h-px bg-slate-800" />

        {/* Vibration / Haptics Toggle */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Vibrate className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-200 block">Vibration</span>
              <span className="text-xs text-slate-400">Tactile haptic feedback on taps</span>
            </div>
          </div>
          <button
            id="settings-vibration-toggle"
            onClick={() => {
              const next = !settings.vibration;
              soundFx.setVibrationEnabled(next);
              soundFx.playTap();
              onUpdateSettings({ vibration: next });
            }}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              settings.vibration ? 'bg-teal-600' : 'bg-slate-750'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.vibration ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="h-px bg-slate-800" />

        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              {settings.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-sm font-bold text-slate-200 block">Dark Mode</span>
              <span className="text-xs text-slate-400">Deep OLED slate aesthetic</span>
            </div>
          </div>
          <button
            id="settings-darkmode-toggle"
            onClick={() => {
              soundFx.playTap();
              onUpdateSettings({ darkMode: !settings.darkMode });
            }}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              settings.darkMode ? 'bg-purple-600' : 'bg-slate-750'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.darkMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="h-px bg-slate-800" />

        {/* Device Frame Mode */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              {settings.deviceFrame ? <Smartphone className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-sm font-bold text-slate-200 block">Android Phone Frame</span>
              <span className="text-xs text-slate-400">Display within realistic phone shell</span>
            </div>
          </div>
          <button
            id="settings-frame-toggle"
            onClick={() => {
              soundFx.playTap();
              onUpdateSettings({ deviceFrame: !settings.deviceFrame });
            }}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              settings.deviceFrame ? 'bg-amber-600' : 'bg-slate-750'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.deviceFrame ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Difficulty Selector */}
      <div className="rounded-3xl p-4 bg-slate-900/90 border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center space-x-2">
          <Gauge className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-bold text-slate-200">Default Game Difficulty</h2>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => {
            const isSelected = settings.difficulty === diff;
            return (
              <button
                key={diff}
                id={`settings-diff-${diff}`}
                onClick={() => {
                  soundFx.playTap();
                  onUpdateSettings({ difficulty: diff });
                }}
                className={`py-2.5 px-3 rounded-2xl text-xs font-bold capitalize transition border active:scale-95 ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800 border-slate-700/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {diff}
              </button>
            );
          })}
        </div>
      </div>

      {/* Android Kotlin & APK Builder Section */}
      <div className="rounded-3xl p-4 bg-slate-900/90 border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-200 block">APK Builder & Android Source</span>
              <span className="text-xs text-slate-400">build-apk.sh, Dockerfile.apk, CI & Jetpack Compose</span>
            </div>
          </div>
        </div>

        <button
          id="settings-android-code-btn"
          onClick={() => {
            soundFx.playTap();
            onOpenAndroidCode();
          }}
          className="w-full py-3 px-4 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center space-x-2 transition active:scale-98"
        >
          <Code2 className="w-4 h-4" />
          <span>Open APK Builder & Source Files</span>
        </button>
      </div>

      {/* Danger Zone: Reset Progress */}
      <div className="rounded-3xl p-4 bg-slate-900/90 border border-rose-900/40 shadow-md space-y-3">
        <div className="flex items-center space-x-2 text-rose-400">
          <AlertTriangle className="w-4 h-4" />
          <h2 className="text-sm font-bold">Reset Game Data</h2>
        </div>
        <p className="text-xs text-slate-400">
          Clear all game high scores, accumulated XP, unlocked achievements, and brain ratings.
        </p>

        {resetDoneNotice && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
            <Check className="w-4 h-4" />
            <span>Progress successfully reset to default!</span>
          </div>
        )}

        <button
          id="settings-reset-trigger-btn"
          onClick={() => setShowResetConfirm(true)}
          className="w-full py-2.5 px-4 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-center space-x-2 transition active:scale-98"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Progress...</span>
        </button>
      </div>

      {/* Reset Confirmation Dialog Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-xs rounded-3xl bg-slate-900 border border-slate-700 p-5 shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Reset All Progress?</h3>
                <p className="text-xs text-slate-400 mt-1">
                  This will erase your Brain Score, Level XP, and all 8 Achievements. This action cannot be undone.
                </p>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  id="settings-cancel-reset-btn"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 active:scale-95 transition"
                >
                  Cancel
                </button>
                <button
                  id="settings-confirm-reset-btn"
                  onClick={handleReset}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 active:scale-95 transition shadow-md shadow-rose-600/30"
                >
                  Yes, Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

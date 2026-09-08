import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Brain } from 'lucide-react';
import { soundFx } from '../utils/sound';

interface WelcomeScreenProps {
  onStart: () => void;
  darkMode?: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, darkMode = true }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-between p-6 text-center select-none relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 -left-12 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-12 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top spacer */}
      <div className="pt-6">
        <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          Cognitive Fitness
        </span>
      </div>

      {/* Center Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 my-auto"
      >
        <div className="relative inline-block">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-500 p-0.5 shadow-2xl shadow-indigo-500/30 mx-auto flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center">
              <span className="text-5xl sm:text-6xl">🧠</span>
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 p-2 rounded-2xl shadow-md border-2 border-slate-900">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-indigo-300 via-purple-200 to-pink-300 bg-clip-text text-transparent">
            BrainBox
          </h1>
          <p className="text-lg sm:text-xl font-medium text-slate-300">
            Train Your Brain. Have Fun.
          </p>
        </div>

        <p className="text-xs sm:text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
          6 science-backed mini games challenging your memory, reaction, pattern recognition, math, logic, and spatial skills.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {['100% Offline', 'Level Progression', '8 Achievements', 'Brain Score Radar'].map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-semibold text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60"
            >
              {tag}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Start Button */}
      <div className="w-full max-w-xs pb-6">
        <motion.button
          id="welcome-start-btn"
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            soundFx.playTap();
            onStart();
          }}
          className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 group transition"
        >
          <span>Start Playing</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>
        <p className="text-[11px] text-slate-500 mt-2">No account required • Instant play</p>
      </div>
    </div>
  );
};

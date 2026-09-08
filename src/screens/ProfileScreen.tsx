import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Award, Flame, TrendingUp, Trophy, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { UserProgress } from '../types';
import { ACHIEVEMENTS, getLevelData, getOverallBrainScore } from '../utils/storage';
import { soundFx } from '../utils/sound';

interface ProfileScreenProps {
  progress: UserProgress;
  onBack: () => void;
  darkMode?: boolean;
}

interface CategoryInfo {
  key: keyof UserProgress['categoryScores'];
  name: string;
  icon: string;
  color: string;
  barColor: string;
}

const CATEGORIES: CategoryInfo[] = [
  { key: 'memory', name: 'Memory', icon: '🧠', color: 'text-pink-400', barColor: 'bg-pink-500' },
  { key: 'reaction', name: 'Reaction', icon: '⚡', color: 'text-emerald-400', barColor: 'bg-emerald-500' },
  { key: 'pattern', name: 'Pattern', icon: '🔍', color: 'text-blue-400', barColor: 'bg-blue-500' },
  { key: 'math', name: 'Math', icon: '🔢', color: 'text-amber-400', barColor: 'bg-amber-500' },
  { key: 'logic', name: 'Logic', icon: '🔐', color: 'text-purple-400', barColor: 'bg-purple-500' },
  { key: 'spatial', name: 'Spatial', icon: '🧩', color: 'text-violet-400', barColor: 'bg-violet-500' },
];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ progress, onBack, darkMode = true }) => {
  const levelData = getLevelData(progress.xp);
  const overallScore = getOverallBrainScore(progress.categoryScores);

  const unlockedCount = ACHIEVEMENTS.filter((a) => progress.achievements[a.id]?.unlocked).length;

  return (
    <div className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full select-none space-y-4 pb-8 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center space-x-3 pt-1">
        <button
          id="profile-back-btn"
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
          <h1 className="text-xl font-black text-slate-100">Brain Profile</h1>
          <p className="text-xs text-slate-400">Cognitive analytics and progress</p>
        </div>
      </div>

      {/* Main Overall Brain Score Display */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl p-5 border text-center relative shadow-lg ${
          darkMode
            ? 'bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/60 border-indigo-500/30'
            : 'bg-white border-slate-200'
        }`}
      >
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-300 block mb-2">
          BRAIN SCORE
        </span>

        <div className="relative inline-flex items-center justify-center mb-2">
          <div className="w-28 h-28 rounded-full border-4 border-indigo-500/30 flex flex-col items-center justify-center bg-indigo-950/40 shadow-inner">
            <span className="text-5xl font-black font-mono tracking-tight text-white">
              {overallScore}
            </span>
            <span className="text-[10px] uppercase font-bold text-indigo-300">/ 100</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 font-medium">
          Calculated from your performance across memory, logic, reaction, math, pattern, and spatial mini-games.
        </p>

        {/* Level Banner */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 text-left">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-slate-200">Level {levelData.level} Explorer</span>
            <span className="text-slate-400 font-mono">
              {levelData.currentXp} / {levelData.nextLevelXp} XP
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
              style={{ width: `${levelData.progressRatio * 100}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* Quick Stat Tiles */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <span className="text-[10px] text-slate-400 block uppercase">Played</span>
          <span className="font-bold text-sm font-mono text-slate-100">{progress.totalGamesPlayed}</span>
        </div>
        <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <span className="text-[10px] text-slate-400 block uppercase">Best</span>
          <span className="font-bold text-sm font-mono text-amber-400">{progress.bestScore}</span>
        </div>
        <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <span className="text-[10px] text-slate-400 block uppercase">Streak</span>
          <span className="font-bold text-sm font-mono text-orange-400">{progress.longestStreak}d</span>
        </div>
        <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <span className="text-[10px] text-slate-400 block uppercase">Badges</span>
          <span className="font-bold text-sm font-mono text-indigo-400">
            {unlockedCount}/{ACHIEVEMENTS.length}
          </span>
        </div>
      </div>

      {/* Cognitive Categories Breakdown */}
      <div className="rounded-3xl p-4 bg-slate-900/90 border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Cognitive Categories
          </h2>
          <span className="text-xs text-slate-500">Scale 0 - 100</span>
        </div>

        <div className="space-y-2.5">
          {CATEGORIES.map((cat) => {
            const score = progress.categoryScores[cat.key] || 50;

            return (
              <div key={cat.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span>{cat.icon}</span>
                    <span className="font-semibold text-slate-200">{cat.name}</span>
                  </div>
                  <span className={`font-mono font-bold ${cat.color}`}>{score}</span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className={`h-full rounded-full ${cat.barColor}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements Shelf */}
      <div className="rounded-3xl p-4 bg-slate-900/90 border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Achievements
            </h2>
          </div>
          <span className="text-xs font-mono text-indigo-400 font-bold">
            {unlockedCount} / {ACHIEVEMENTS.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ACHIEVEMENTS.map((ach) => {
            const isUnlocked = progress.achievements[ach.id]?.unlocked;

            return (
              <div
                key={ach.id}
                className={`p-3 rounded-2xl border flex items-center space-x-3 transition ${
                  isUnlocked
                    ? 'bg-indigo-950/40 border-indigo-500/40 text-slate-100 shadow-xs'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-500 opacity-60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                    isUnlocked
                      ? 'bg-amber-500/20 border border-amber-400/40'
                      : 'bg-slate-800 border border-slate-700/60 grayscale'
                  }`}
                >
                  {ach.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <h3 className="text-xs font-bold truncate text-slate-200">{ach.title}</h3>
                    {isUnlocked && <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{ach.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

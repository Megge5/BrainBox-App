import React from 'react';
import { motion } from 'motion/react';
import {
  Brain,
  Zap,
  HelpCircle,
  Hash,
  KeyRound,
  Puzzle,
  TrendingUp,
  Settings,
  Code2,
  ChevronRight,
  Flame,
  Award,
} from 'lucide-react';
import { GameType, UserProgress } from '../types';
import { getLevelData, getOverallBrainScore } from '../utils/storage';
import { soundFx } from '../utils/sound';

interface HomeScreenProps {
  progress: UserProgress;
  onSelectGame: (game: GameType) => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenAndroidCode: () => void;
  darkMode?: boolean;
}

interface GameCardConfig {
  type: GameType;
  title: string;
  category: string;
  desc: string;
  icon: string;
  colorBg: string;
  colorBorder: string;
  accentText: string;
}

const GAME_CARDS: GameCardConfig[] = [
  {
    type: 'memory',
    title: 'Memory Match',
    category: 'Memory',
    desc: 'Flip and match hidden card pairs',
    icon: '🧠',
    colorBg: 'from-pink-500/20 to-rose-500/10',
    colorBorder: 'border-pink-500/30',
    accentText: 'text-pink-400',
  },
  {
    type: 'reaction',
    title: 'Reaction Test',
    category: 'Reaction',
    desc: 'Tap instantaneously when screen turns green',
    icon: '⚡',
    colorBg: 'from-emerald-500/20 to-teal-500/10',
    colorBorder: 'border-emerald-500/30',
    accentText: 'text-emerald-400',
  },
  {
    type: 'pattern',
    title: 'Pattern Challenge',
    category: 'Pattern',
    desc: 'Deduce the missing number in sequences',
    icon: '🔍',
    colorBg: 'from-blue-500/20 to-cyan-500/10',
    colorBorder: 'border-blue-500/30',
    accentText: 'text-blue-400',
  },
  {
    type: 'number',
    title: 'Number Challenge',
    category: 'Math',
    desc: 'Rapid-fire timed mental arithmetic',
    icon: '🔢',
    colorBg: 'from-amber-500/20 to-yellow-500/10',
    colorBorder: 'border-amber-500/30',
    accentText: 'text-amber-400',
  },
  {
    type: 'codebreaker',
    title: 'Code Breaker',
    category: 'Logic',
    desc: 'Deduce the 4-color secret code from clues',
    icon: '🔐',
    colorBg: 'from-purple-500/20 to-indigo-500/10',
    colorBorder: 'border-purple-500/30',
    accentText: 'text-purple-400',
  },
  {
    type: 'puzzle',
    title: '8-Puzzle',
    category: 'Spatial',
    desc: 'Slide numbered tiles into correct 1-8 order',
    icon: '🧩',
    colorBg: 'from-violet-500/20 to-fuchsia-500/10',
    colorBorder: 'border-violet-500/30',
    accentText: 'text-violet-400',
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  progress,
  onSelectGame,
  onOpenProfile,
  onOpenSettings,
  onOpenAndroidCode,
  darkMode = true,
}) => {
  const levelData = getLevelData(progress.xp);
  const brainScore = getOverallBrainScore(progress.categoryScores);

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 max-w-md mx-auto w-full select-none">
      {/* Top App Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🧠</span>
            <h1 className="text-2xl font-black tracking-tight text-white">BrainBox</h1>
          </div>
          <p className="text-xs text-slate-400 font-medium">Train Your Brain. Have Fun.</p>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            id="home-code-viewer-btn"
            onClick={() => {
              soundFx.playTap();
              onOpenAndroidCode();
            }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition active:scale-95 border border-slate-700/60"
            title="APK Builder & Android Source Code"
            aria-label="APK Builder & Android Source Code"
          >
            <Code2 className="w-4 h-4 text-emerald-400" />
          </button>

          <button
            id="home-settings-btn"
            onClick={() => {
              soundFx.playTap();
              onOpenSettings();
            }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition active:scale-95 border border-slate-700/60"
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Stats Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl p-4 border shadow-lg relative overflow-hidden ${
          darkMode
            ? 'bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/40 border-indigo-500/30'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {/* Circular Brain Score Ring */}
            <div className="relative w-16 h-16 rounded-2xl bg-indigo-600/30 border-2 border-indigo-400 flex flex-col items-center justify-center shadow-md">
              <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">
                Score
              </span>
              <span className="text-2xl font-black font-mono leading-none text-white">
                {brainScore}
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">
                  Brain Score
                </span>
                {progress.currentStreak > 0 && (
                  <span className="flex items-center text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                    <Flame className="w-3 h-3 mr-0.5 fill-amber-400" /> {progress.currentStreak}d streak
                  </span>
                )}
              </div>
              <div className="text-sm font-semibold text-slate-200">
                Level {levelData.level} Cognitive Explorer
              </div>
              <div className="text-[11px] text-slate-400">
                {levelData.currentXp} / {levelData.nextLevelXp} XP to next level
              </div>
            </div>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${levelData.progressRatio * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
          />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80 mb-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block leading-tight">
                Games Played
              </span>
              <span className="font-bold text-sm font-mono text-slate-200">
                {progress.totalGamesPlayed}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block leading-tight">
                Best Score
              </span>
              <span className="font-bold text-sm font-mono text-amber-400">
                {progress.bestScore}
              </span>
            </div>
          </div>
        </div>

        {/* My Progress Button */}
        <button
          id="home-my-progress-btn"
          onClick={() => {
            soundFx.playTap();
            onOpenProfile();
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-400/40 text-indigo-200 text-xs font-bold flex items-center justify-center space-x-1.5 transition active:scale-98"
        >
          <span>My Progress & Brain Radar</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </motion.div>

      {/* Mini-Games Section Title */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Mini-Games ({GAME_CARDS.length})
        </h2>
        <span className="text-[11px] text-indigo-400 font-semibold">Ready to play</span>
      </div>

      {/* Games List / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pb-6">
        {GAME_CARDS.map((game, idx) => {
          const highScore = progress.gameHighScores[game.type] || 0;

          return (
            <motion.button
              key={game.type}
              id={`game-card-${game.type}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                soundFx.playTap();
                onSelectGame(game.type);
              }}
              className={`rounded-2xl p-3.5 border text-left flex items-center space-x-3.5 shadow-sm transition hover:shadow-md active:scale-97 ${
                darkMode
                  ? `bg-gradient-to-r ${game.colorBg} bg-slate-900/90 ${game.colorBorder}`
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              {/* Game Icon */}
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-2xl shrink-0 shadow-sm">
                {game.icon}
              </div>

              {/* Game Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-100 truncate">{game.title}</h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${game.accentText}`}>
                    {game.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 leading-snug">
                  {game.desc}
                </p>

                {/* High score pill */}
                <div className="mt-1.5 flex items-center space-x-2">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Best: <strong className="text-slate-200">{highScore > 0 ? highScore : '—'}</strong>
                  </span>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

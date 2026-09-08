import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Home, Award, Sparkles, TrendingUp, Clock, Move, Target, Flame } from 'lucide-react';
import { GameResultData, UserProgress } from '../types';
import { getLevelData } from '../utils/storage';
import { ConfettiBurst } from '../components/ConfettiBurst';
import { soundFx } from '../utils/sound';

interface ResultsScreenProps {
  result: GameResultData;
  progress: UserProgress;
  onPlayAgain: () => void;
  onHome: () => void;
  onViewProfile: () => void;
  darkMode?: boolean;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  result,
  progress,
  onPlayAgain,
  onHome,
  onViewProfile,
  darkMode = true,
}) => {
  const levelData = getLevelData(progress.xp);

  useEffect(() => {
    soundFx.playWin();
  }, []);

  const getPerformanceBadgeColor = (perf: string) => {
    switch (perf) {
      case 'Incredible!':
        return 'bg-purple-500/20 border-purple-400 text-purple-300';
      case 'Excellent!':
        return 'bg-emerald-500/20 border-emerald-400 text-emerald-300';
      case 'Good!':
        return 'bg-indigo-500/20 border-indigo-400 text-indigo-300';
      default:
        return 'bg-amber-500/20 border-amber-400 text-amber-300';
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-4 max-w-sm mx-auto w-full select-none relative">
      <ConfettiBurst active={result.isNewBest || result.performance === 'Incredible!'} />

      {/* Top Banner: Game Name */}
      <div className="text-center pt-2">
        <span className="text-3xl mb-1 inline-block">{result.icon}</span>
        <h2 className="text-xl font-bold text-slate-100">{result.gameTitle}</h2>
        <span className="text-xs text-slate-400">Game Session Completed</span>
      </div>

      {/* Main Score Hero Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`w-full rounded-3xl p-5 border text-center relative overflow-hidden shadow-xl ${
          darkMode ? 'bg-slate-900/90 border-indigo-500/40' : 'bg-white border-slate-200'
        }`}
      >
        {result.isNewBest && (
          <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[11px] font-black uppercase tracking-wider py-1 flex items-center justify-center space-x-1 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Personal Best!</span>
          </div>
        )}

        <div className={`space-y-2 ${result.isNewBest ? 'pt-4' : ''}`}>
          <span className="text-xs uppercase font-bold tracking-widest text-slate-400">
            Score
          </span>
          <div className="text-6xl font-black font-mono tracking-tight text-white">
            {result.score}
          </div>

          <div className="inline-block">
            <span
              className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${getPerformanceBadgeColor(
                result.performance
              )}`}
            >
              {result.performance}
            </span>
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-slate-800 text-left">
          {typeof result.moves === 'number' && (
            <div className="flex items-center space-x-2 bg-slate-800/40 p-2 rounded-xl">
              <Move className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Moves</span>
                <span className="font-bold text-sm font-mono text-slate-200">{result.moves}</span>
              </div>
            </div>
          )}

          {typeof result.timeSeconds === 'number' && (
            <div className="flex items-center space-x-2 bg-slate-800/40 p-2 rounded-xl">
              <Clock className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Time</span>
                <span className="font-bold text-sm font-mono text-slate-200">
                  {result.timeSeconds}s
                </span>
              </div>
            </div>
          )}

          {typeof result.accuracy === 'number' && (
            <div className="flex items-center space-x-2 bg-slate-800/40 p-2 rounded-xl">
              <Target className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Correct</span>
                <span className="font-bold text-sm font-mono text-slate-200">{result.accuracy}</span>
              </div>
            </div>
          )}

          {typeof result.reactionTimeMs === 'number' && (
            <div className="flex items-center space-x-2 bg-slate-800/40 p-2 rounded-xl">
              <Clock className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Reaction</span>
                <span className="font-bold text-sm font-mono text-amber-400">
                  {result.reactionTimeMs} ms
                </span>
              </div>
            </div>
          )}

          {typeof result.streak === 'number' && result.streak > 0 && (
            <div className="flex items-center space-x-2 bg-slate-800/40 p-2 rounded-xl">
              <Flame className="w-4 h-4 text-orange-400" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Max Streak</span>
                <span className="font-bold text-sm font-mono text-orange-400">{result.streak}×</span>
              </div>
            </div>
          )}
        </div>

        {/* XP Gained & Level Progress */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-left">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-indigo-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> +{result.xpEarned} XP Earned
            </span>
            <span className="text-slate-400 font-mono">
              Level {levelData.level} ({levelData.currentXp}/{levelData.nextLevelXp} XP)
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${levelData.progressRatio * 100}%` }}
            />
          </div>
        </div>

        {/* Unlocked Achievements banner */}
        {result.newAchievements.length > 0 && (
          <div className="mt-4 p-2.5 rounded-2xl bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs text-center font-bold flex items-center justify-center space-x-2 animate-bounce">
            <span>🏆</span>
            <span>Unlocked {result.newAchievements.length} New Achievement!</span>
          </div>
        )}
      </motion.div>

      {/* Action Buttons */}
      <div className="w-full space-y-2 mt-4 pb-2">
        <button
          id="results-play-again-btn"
          onClick={() => {
            soundFx.playTap();
            onPlayAgain();
          }}
          className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition active:scale-97"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Play Again</span>
        </button>

        <div className="flex space-x-2">
          <button
            id="results-home-btn"
            onClick={() => {
              soundFx.playTap();
              onHome();
            }}
            className={`flex-1 py-3 px-4 rounded-2xl font-semibold text-xs flex items-center justify-center space-x-1.5 transition active:scale-97 ${
              darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>

          <button
            id="results-profile-btn"
            onClick={() => {
              soundFx.playTap();
              onViewProfile();
            }}
            className={`flex-1 py-3 px-4 rounded-2xl font-semibold text-xs flex items-center justify-center space-x-1.5 transition active:scale-97 ${
              darkMode ? 'bg-slate-800 hover:bg-slate-700 text-indigo-300' : 'bg-slate-200 hover:bg-slate-300 text-indigo-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Brain Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

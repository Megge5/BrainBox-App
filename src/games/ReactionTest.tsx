import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Zap, AlertTriangle, CheckCircle2, RotateCcw, Home, Award } from 'lucide-react';
import { soundFx } from '../utils/sound';
import { GameResultData } from '../types';

interface ReactionTestProps {
  onFinish: (result: Omit<GameResultData, 'xpEarned' | 'isNewBest' | 'newAchievements'>) => void;
  onHome: () => void;
  darkMode?: boolean;
}

type ReactionState = 'idle' | 'waiting' | 'ready' | 'too_early' | 'success';

export const ReactionTest: React.FC<ReactionTestProps> = ({ onFinish, onHome, darkMode = true }) => {
  const [gameState, setGameState] = useState<ReactionState>('idle');
  const [reactionTimeMs, setReactionTimeMs] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number[]>([]);
  const [rating, setRating] = useState<string>('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startRound = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setGameState('waiting');
    soundFx.playTap();

    // Random delay between 1500ms and 4000ms
    const randomDelay = Math.floor(Math.random() * 2500) + 1500;

    timerRef.current = setTimeout(() => {
      startTimeRef.current = performance.now();
      setGameState('ready');
      soundFx.playReactionBeep();
    }, randomDelay);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleScreenClick = () => {
    if (gameState === 'idle') {
      startRound();
    } else if (gameState === 'waiting') {
      // Tapped too early!
      if (timerRef.current) clearTimeout(timerRef.current);
      setGameState('too_early');
      soundFx.playError();
    } else if (gameState === 'ready') {
      // Successful tap!
      const endTime = performance.now();
      const diff = Math.round(endTime - startTimeRef.current);
      setReactionTimeMs(diff);
      setGameState('success');
      soundFx.playWin();

      const newAttempts = [...attempts, diff];
      setAttempts(newAttempts);

      // Evaluate performance rating
      let perfRating: 'Incredible!' | 'Excellent!' | 'Good!' | 'Average' | 'Keep Practicing' = 'Keep Practicing';
      if (diff < 200) perfRating = 'Incredible!';
      else if (diff <= 300) perfRating = 'Excellent!';
      else if (diff <= 400) perfRating = 'Good!';
      else if (diff <= 500) perfRating = 'Average';
      else perfRating = 'Keep Practicing';

      setRating(perfRating);
    }
  };

  const calculateScore = (timeMs: number): number => {
    if (timeMs < 180) return 1000;
    if (timeMs < 250) return Math.round(1000 - (timeMs - 180) * 2);
    if (timeMs < 400) return Math.round(860 - (timeMs - 250) * 2);
    if (timeMs < 600) return Math.round(560 - (timeMs - 400) * 1.5);
    return Math.max(100, Math.round(260 - (timeMs - 600) * 0.5));
  };

  const bestReaction = attempts.length > 0 ? Math.min(...attempts) : null;
  const avgReaction =
    attempts.length > 0 ? Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length) : null;

  const handleFinishAndSave = () => {
    const targetMs = bestReaction ?? (reactionTimeMs || 350);
    const score = calculateScore(targetMs);

    let perf: 'Incredible!' | 'Excellent!' | 'Good!' | 'Average' | 'Keep Practicing' = 'Average';
    if (targetMs < 200) perf = 'Incredible!';
    else if (targetMs <= 300) perf = 'Excellent!';
    else if (targetMs <= 400) perf = 'Good!';
    else if (targetMs <= 500) perf = 'Average';
    else perf = 'Keep Practicing';

    onFinish({
      gameType: 'reaction',
      gameTitle: 'Reaction Test',
      icon: '⚡',
      score,
      performance: perf,
      reactionTimeMs: targetMs,
      timeSeconds: Math.round(targetMs / 1000),
    });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-4 relative select-none">
      {/* Top Stats Banner */}
      <div
        className={`w-full max-w-sm rounded-2xl p-3 flex items-center justify-around border shadow-sm ${
          darkMode ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-400">Attempts</span>
          <span className="font-bold text-sm font-mono">{attempts.length}</span>
        </div>
        <div className="h-6 w-px bg-slate-700/40" />
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-400">Best</span>
          <span className="font-bold text-sm font-mono text-emerald-400">
            {bestReaction !== null ? `${bestReaction} ms` : '—'}
          </span>
        </div>
        <div className="h-6 w-px bg-slate-700/40" />
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-400">Average</span>
          <span className="font-bold text-sm font-mono text-indigo-400">
            {avgReaction !== null ? `${avgReaction} ms` : '—'}
          </span>
        </div>
      </div>

      {/* Main Interactive Stage Area */}
      <motion.button
        id="reaction-tap-area"
        onClick={handleScreenClick}
        whileTap={{ scale: 0.98 }}
        className={`w-full max-w-sm my-auto rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all duration-200 shadow-xl cursor-pointer min-h-[320px] ${
          gameState === 'idle'
            ? darkMode
              ? 'bg-slate-800/80 hover:bg-slate-800 border-2 border-dashed border-indigo-500/40 text-slate-200'
              : 'bg-slate-100 hover:bg-slate-200/80 border-2 border-dashed border-indigo-400 text-slate-800'
            : gameState === 'waiting'
            ? 'bg-rose-950/90 border-2 border-rose-600 text-rose-200'
            : gameState === 'ready'
            ? 'bg-emerald-500 border-4 border-emerald-300 text-slate-950 scale-102'
            : gameState === 'too_early'
            ? 'bg-amber-950/90 border-2 border-amber-500 text-amber-200'
            : 'bg-indigo-950/90 border-2 border-indigo-500 text-indigo-100'
        }`}
      >
        {gameState === 'idle' && (
          <div className="space-y-4">
            <div className="w-20 h-20 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center mx-auto text-indigo-400">
              <Zap className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black">Tap to Begin</h2>
            <p className="text-sm text-slate-400 max-w-[220px] mx-auto">
              When the screen turns <strong className="text-emerald-400 font-bold">GREEN</strong>, tap as quickly as you can!
            </p>
          </div>
        )}

        {gameState === 'waiting' && (
          <div className="space-y-4 animate-pulse">
            <div className="w-20 h-20 rounded-full bg-rose-500/20 border border-rose-500/50 flex items-center justify-center mx-auto text-rose-400">
              <span className="text-3xl">⏳</span>
            </div>
            <h2 className="text-3xl font-black tracking-wider text-rose-200">WAIT...</h2>
            <p className="text-xs text-rose-300/80">Wait for green! Don't tap yet.</p>
          </div>
        )}

        {gameState === 'ready' && (
          <div className="space-y-3">
            <div className="w-24 h-24 rounded-full bg-white/30 flex items-center justify-center mx-auto text-slate-950">
              <Zap className="w-14 h-14 fill-current" />
            </div>
            <h2 className="text-5xl font-black tracking-tight text-slate-950 animate-bounce">
              TAP!
            </h2>
            <p className="text-sm font-bold text-slate-900">FAST AS LIGHTNING!</p>
          </div>
        )}

        {gameState === 'too_early' && (
          <div className="space-y-4">
            <div className="w-20 h-20 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center mx-auto text-amber-400">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-amber-300">Too Early!</h2>
            <p className="text-sm text-amber-200/80">You tapped before the screen turned green.</p>
            <div className="text-xs font-semibold uppercase tracking-wider bg-amber-500/20 px-4 py-2 rounded-full inline-block text-amber-300">
              Tap anywhere to Try Again
            </div>
          </div>
        )}

        {gameState === 'success' && reactionTimeMs !== null && (
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center mx-auto text-indigo-300">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="text-xs uppercase tracking-widest text-indigo-300 font-semibold">
              Reaction Time
            </span>
            <div className="text-5xl font-black font-mono tracking-tight text-white">
              {reactionTimeMs} <span className="text-2xl font-bold text-indigo-400">ms</span>
            </div>
            <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-sm font-bold text-indigo-200">
              {rating}
            </div>
            <p className="text-xs text-slate-400 pt-2">Tap below to test again or save score</p>
          </div>
        )}
      </motion.button>

      {/* Control Buttons */}
      <div className="w-full max-w-sm space-y-2 mt-3">
        {gameState === 'success' ? (
          <div className="flex space-x-2">
            <button
              id="reaction-try-again-btn"
              onClick={startRound}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition active:scale-95 ${
                darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-100' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
            <button
              id="reaction-submit-btn"
              onClick={handleFinishAndSave}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition active:scale-95"
            >
              <Award className="w-4 h-4" />
              <span>Save & View</span>
            </button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <button
              id="reaction-home-btn"
              onClick={() => {
                soundFx.playTap();
                onHome();
              }}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 transition active:scale-95 ${
                darkMode ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

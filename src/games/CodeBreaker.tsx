import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Check, HelpCircle, Delete, Lock, Unlock } from 'lucide-react';
import { soundFx } from '../utils/sound';
import { GameResultData } from '../types';

interface CodeBreakerProps {
  onFinish: (result: Omit<GameResultData, 'xpEarned' | 'isNewBest' | 'newAchievements'>) => void;
  onHome: () => void;
  darkMode?: boolean;
}

interface ColorOption {
  id: string;
  name: string;
  emoji: string;
  bgClass: string;
  borderClass: string;
}

const AVAILABLE_COLORS: ColorOption[] = [
  { id: 'red', name: 'Red', emoji: '🔴', bgClass: 'bg-red-500', borderClass: 'border-red-400' },
  { id: 'green', name: 'Green', emoji: '🟢', bgClass: 'bg-emerald-500', borderClass: 'border-emerald-400' },
  { id: 'blue', name: 'Blue', emoji: '🔵', bgClass: 'bg-blue-500', borderClass: 'border-blue-400' },
  { id: 'yellow', name: 'Yellow', emoji: '🟡', bgClass: 'bg-amber-400', borderClass: 'border-amber-300' },
  { id: 'purple', name: 'Purple', emoji: '🟣', bgClass: 'bg-purple-500', borderClass: 'border-purple-400' },
  { id: 'orange', name: 'Orange', emoji: '🟠', bgClass: 'bg-orange-500', borderClass: 'border-orange-400' },
];

interface GuessRow {
  colors: string[];
  exactCount: number; // ●
  partialCount: number; // ○
  missCount: number; // ✕
}

export const CodeBreaker: React.FC<CodeBreakerProps> = ({ onFinish, onHome, darkMode = true }) => {
  const [secretCode, setSecretCode] = useState<string[]>([]);
  const [pastGuesses, setPastGuesses] = useState<GuessRow[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showRules, setShowRules] = useState(false);

  const maxAttempts = 8;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const initGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    // Pick 4 unique colors from available 6
    const shuffled = [...AVAILABLE_COLORS].sort(() => 0.5 - Math.random()).slice(0, 4);
    const code = shuffled.map((c) => c.id);
    setSecretCode(code);
    setPastGuesses([]);
    setCurrentGuess([]);
    setIsGameOver(false);
    setIsWon(false);
    setElapsedSeconds(0);

    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
  };

  useEffect(() => {
    initGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleAddColor = (colorId: string) => {
    if (currentGuess.length >= 4 || isGameOver) return;
    soundFx.playTap();
    setCurrentGuess([...currentGuess, colorId]);
  };

  const handleRemoveColor = () => {
    if (currentGuess.length === 0 || isGameOver) return;
    soundFx.playTap();
    setCurrentGuess(currentGuess.slice(0, -1));
  };

  const handleSubmitGuess = () => {
    if (currentGuess.length !== 4 || isGameOver) return;

    let exact = 0;
    let partial = 0;

    const secretCopy = [...secretCode];
    const guessCopy = [...currentGuess];

    // First pass: find exact matches
    for (let i = 0; i < 4; i++) {
      if (guessCopy[i] === secretCopy[i]) {
        exact++;
        secretCopy[i] = 'MATCHED';
        guessCopy[i] = 'MATCHED_GUESS';
      }
    }

    // Second pass: find partial matches
    for (let i = 0; i < 4; i++) {
      if (guessCopy[i] !== 'MATCHED_GUESS') {
        const secretIdx = secretCopy.findIndex((s) => s === guessCopy[i]);
        if (secretIdx !== -1) {
          partial++;
          secretCopy[secretIdx] = 'PARTIAL_MATCHED';
        }
      }
    }

    const misses = 4 - (exact + partial);

    const newRow: GuessRow = {
      colors: currentGuess,
      exactCount: exact,
      partialCount: partial,
      missCount: misses,
    };

    const newHistory = [...pastGuesses, newRow];
    setPastGuesses(newHistory);
    setCurrentGuess([]);

    if (exact === 4) {
      // WIN!
      handleGameEnd(true, newHistory.length);
    } else if (newHistory.length >= maxAttempts) {
      // LOSE
      handleGameEnd(false, newHistory.length);
    } else {
      soundFx.playCardFlip();
    }
  };

  const handleGameEnd = (won: boolean, attemptsTaken: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsGameOver(true);
    setIsWon(won);

    if (won) {
      soundFx.playWin();
    } else {
      soundFx.playError();
    }

    const calculatedScore = won ? Math.max(150, 1000 - (attemptsTaken - 1) * 110 - elapsedSeconds * 4) : 50;

    let perf: 'Incredible!' | 'Excellent!' | 'Good!' | 'Average' | 'Keep Practicing' = 'Keep Practicing';
    if (won) {
      if (attemptsTaken <= 3) perf = 'Incredible!';
      else if (attemptsTaken <= 5) perf = 'Excellent!';
      else perf = 'Good!';
    } else {
      perf = 'Keep Practicing';
    }

    setTimeout(() => {
      onFinish({
        gameType: 'codebreaker',
        gameTitle: 'Code Breaker',
        icon: '🔐',
        score: calculatedScore,
        performance: perf,
        moves: attemptsTaken,
        timeSeconds: elapsedSeconds,
      });
    }, 1800);
  };

  const getColorData = (id: string) => AVAILABLE_COLORS.find((c) => c.id === id);

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-3.5 relative select-none">
      {/* Top Header stats */}
      <div
        className={`w-full max-w-sm rounded-2xl p-2.5 flex items-center justify-between border shadow-sm ${
          darkMode ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-center space-x-2">
          {isWon ? (
            <Unlock className="w-4 h-4 text-emerald-400" />
          ) : (
            <Lock className="w-4 h-4 text-amber-400" />
          )}
          <span className="font-bold text-sm">
            Attempt {Math.min(pastGuesses.length + 1, maxAttempts)}/{maxAttempts}
          </span>
        </div>

        <button
          id="codebreaker-rules-btn"
          onClick={() => setShowRules(!showRules)}
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
        >
          <HelpCircle className="w-3.5 h-3.5" /> Clue Guide
        </button>
      </div>

      {/* Clue Guide Banner Modal */}
      <AnimatePresence>
        {showRules && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`w-full max-w-sm p-3 rounded-2xl border text-xs my-2 space-y-1 shadow-md ${
              darkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span>● = Correct color and position</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border-2 border-amber-400 inline-block" />
              <span>○ = Correct color, wrong position</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-rose-400 font-bold">✕</span>
              <span>✕ = Color not in the secret code</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Board Rows History */}
      <div
        className={`w-full max-w-sm my-auto rounded-3xl p-3 border shadow-md flex flex-col space-y-2 max-h-[380px] overflow-y-auto ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        {Array.from({ length: maxAttempts }).map((_, rowIndex) => {
          const pastRow = pastGuesses[rowIndex];
          const isCurrentRow = rowIndex === pastGuesses.length && !isGameOver;

          return (
            <div
              key={rowIndex}
              className={`p-2 rounded-2xl flex items-center justify-between border transition-all ${
                isCurrentRow
                  ? 'border-indigo-500/80 bg-indigo-500/10 shadow-sm'
                  : pastRow
                  ? darkMode
                    ? 'border-slate-800 bg-slate-850/50'
                    : 'border-slate-200 bg-slate-50'
                  : 'border-slate-800/40 opacity-40'
              }`}
            >
              <span className="text-[11px] font-mono text-slate-500 w-4 font-semibold">
                {rowIndex + 1}
              </span>

              {/* 4 Pegs */}
              <div className="flex items-center space-x-2">
                {[0, 1, 2, 3].map((slotIdx) => {
                  let colorId = '';
                  if (pastRow) {
                    colorId = pastRow.colors[slotIdx];
                  } else if (isCurrentRow) {
                    colorId = currentGuess[slotIdx] || '';
                  }

                  const colorInfo = getColorData(colorId);

                  return (
                    <div
                      key={slotIdx}
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        colorInfo
                          ? `${colorInfo.bgClass} ${colorInfo.borderClass} shadow-sm text-sm`
                          : darkMode
                          ? 'border-dashed border-slate-700 bg-slate-900/60'
                          : 'border-dashed border-slate-300 bg-slate-100'
                      }`}
                    >
                      {colorInfo ? colorInfo.emoji : ''}
                    </div>
                  );
                })}
              </div>

              {/* Feedback Clues Column */}
              <div className="w-16 flex items-center justify-end space-x-1 font-mono text-xs">
                {pastRow ? (
                  <div className="flex items-center space-x-1">
                    {/* Exact ● */}
                    {Array.from({ length: pastRow.exactCount }).map((_, i) => (
                      <span key={`ex-${i}`} className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-xs" />
                    ))}
                    {/* Partial ○ */}
                    {Array.from({ length: pastRow.partialCount }).map((_, i) => (
                      <span key={`pt-${i}`} className="w-2.5 h-2.5 rounded-full border-2 border-amber-400 inline-block" />
                    ))}
                    {/* Miss ✕ */}
                    {Array.from({ length: pastRow.missCount }).map((_, i) => (
                      <span key={`ms-${i}`} className="text-slate-500 text-[10px] font-bold">✕</span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-600">••••</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Secret code revealed on game over */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-sm p-4 rounded-2xl border text-center mb-2 shadow-xl ${
              isWon
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                : 'bg-rose-950/80 border-rose-500 text-rose-200'
            }`}
          >
            <h3 className="font-black text-lg mb-1">
              {isWon ? 'You Cracked the Code! 🎉' : 'Code Not Cracked 🔒'}
            </h3>
            <div className="flex items-center justify-center space-x-2 my-2">
              <span className="text-xs uppercase text-slate-400 mr-1">Secret:</span>
              {secretCode.map((cId, i) => {
                const c = getColorData(cId);
                return (
                  <div
                    key={i}
                    className={`w-7 h-7 rounded-full ${c?.bgClass} flex items-center justify-center text-xs shadow-md`}
                  >
                    {c?.emoji}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Color Selector Palette */}
      {!isGameOver && (
        <div className="w-full max-w-sm space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Select 4 Colors
            </span>
            <button
              id="codebreaker-clear-btn"
              onClick={handleRemoveColor}
              disabled={currentGuess.length === 0}
              className="text-xs text-rose-400 disabled:opacity-30 flex items-center gap-1 font-medium hover:text-rose-300"
            >
              <Delete className="w-3.5 h-3.5" /> Backspace
            </button>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {AVAILABLE_COLORS.map((color) => {
              const isAlreadySelected = currentGuess.includes(color.id);
              return (
                <motion.button
                  key={color.id}
                  id={`color-picker-${color.id}`}
                  whileTap={{ scale: 0.9 }}
                  disabled={isAlreadySelected || currentGuess.length >= 4}
                  onClick={() => handleAddColor(color.id)}
                  className={`aspect-square rounded-2xl flex items-center justify-center text-xl shadow-md border-2 transition-all ${
                    color.bgClass
                  } ${color.borderClass} ${
                    isAlreadySelected || currentGuess.length >= 4 ? 'opacity-30 scale-95' : 'hover:scale-105 active:scale-95'
                  }`}
                  title={color.name}
                >
                  <span>{color.emoji}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Submit Guess Button */}
          <button
            id="codebreaker-submit-btn"
            onClick={handleSubmitGuess}
            disabled={currentGuess.length !== 4}
            className="w-full py-3.5 rounded-2xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/25 transition active:scale-98"
          >
            <Check className="w-4 h-4" />
            <span>Submit Guess ({currentGuess.length}/4)</span>
          </button>
        </div>
      )}

      {/* Bottom controls */}
      <div className="w-full max-w-sm flex items-center justify-between text-xs text-slate-400 px-2 mt-2">
        <button
          id="codebreaker-reset-btn"
          onClick={() => {
            soundFx.playTap();
            initGame();
          }}
          className="hover:text-slate-200 py-1"
        >
          New Secret Code
        </button>
        <button
          id="codebreaker-home-btn"
          onClick={() => {
            soundFx.playTap();
            onHome();
          }}
          className="hover:text-slate-200 py-1"
        >
          Return Home
        </button>
      </div>
    </div>
  );
};

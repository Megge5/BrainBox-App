import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Clock, Move, Trophy, Award } from 'lucide-react';
import { soundFx } from '../utils/sound';
import { Difficulty, GameResultData } from '../types';

interface MemoryMatchProps {
  difficulty: Difficulty;
  onFinish: (result: Omit<GameResultData, 'xpEarned' | 'isNewBest' | 'newAchievements'>) => void;
  onHome: () => void;
  darkMode?: boolean;
}

interface CardItem {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const ALL_SYMBOLS = ['🍎', '🍌', '🍇', '🍉', '⭐', '❤️', '🌙', '☀️', '🎵', '🚀', '🐱', '🐶', '🌸', '🍀', '🔥', '🎯'];

export const MemoryMatch: React.FC<MemoryMatchProps> = ({
  difficulty,
  onFinish,
  onHome,
  darkMode = true,
}) => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Determine pair count based on difficulty
  const pairCount = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 8 : 12;

  const initGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setMoves(0);
    setElapsedSeconds(0);
    setSelectedIndices([]);
    setIsLocked(false);
    setIsCompleted(false);

    // Pick random symbols
    const shuffledSymbols = [...ALL_SYMBOLS].sort(() => 0.5 - Math.random()).slice(0, pairCount);
    const cardDeck: CardItem[] = [];

    shuffledSymbols.forEach((symbol, index) => {
      cardDeck.push({ id: index * 2, symbol, isFlipped: false, isMatched: false });
      cardDeck.push({ id: index * 2 + 1, symbol, isFlipped: false, isMatched: false });
    });

    // Shuffle deck
    cardDeck.sort(() => 0.5 - Math.random());
    setCards(cardDeck);
    setIsGameActive(true);
  };

  useEffect(() => {
    initGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [difficulty]);

  useEffect(() => {
    if (isGameActive && !isCompleted) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGameActive, isCompleted]);

  const handleCardClick = (index: number) => {
    if (isLocked) return;
    const card = cards[index];
    if (card.isFlipped || card.isMatched) return;

    soundFx.playCardFlip();

    const newCards = [...cards];
    newCards[index] = { ...card, isFlipped: true };
    setCards(newCards);

    const newSelected = [...selectedIndices, index];
    setSelectedIndices(newSelected);

    if (newSelected.length === 2) {
      setMoves((prev) => prev + 1);
      setIsLocked(true);

      const [firstIdx, secondIdx] = newSelected;
      const firstCard = newCards[firstIdx];
      const secondCard = newCards[secondIdx];

      if (firstCard.symbol === secondCard.symbol) {
        // Matched!
        setTimeout(() => {
          soundFx.playMatchSuccess();
          const matchedDeck = newCards.map((c, i) =>
            i === firstIdx || i === secondIdx ? { ...c, isMatched: true } : c
          );
          setCards(matchedDeck);
          setSelectedIndices([]);
          setIsLocked(false);

          // Check if all matched
          const allMatched = matchedDeck.every((c) => c.isMatched);
          if (allMatched) {
            handleVictory(matchedDeck, moves + 1, elapsedSeconds);
          }
        }, 400);
      } else {
        // Not matched
        setTimeout(() => {
          soundFx.playError();
          const unFlippedDeck = newCards.map((c, i) =>
            i === firstIdx || i === secondIdx ? { ...c, isFlipped: false } : c
          );
          setCards(unFlippedDeck);
          setSelectedIndices([]);
          setIsLocked(false);
        }, 900);
      }
    }
  };

  const handleVictory = (finalCards: CardItem[], finalMoves: number, finalTime: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsCompleted(true);
    setIsGameActive(false);

    // Score: Math.max(1000 - moves * 20 - elapsedSeconds * 5, 100)
    // Add difficulty multiplier
    const diffMultiplier = difficulty === 'hard' ? 1.4 : difficulty === 'medium' ? 1.0 : 0.8;
    const rawScore = Math.max(1000 - finalMoves * 20 - finalTime * 5, 100);
    const calculatedScore = Math.round(rawScore * diffMultiplier);

    setFinalScore(calculatedScore);
    soundFx.playWin();

    let rating: 'Incredible!' | 'Excellent!' | 'Good!' | 'Average' | 'Keep Practicing' = 'Average';
    if (calculatedScore >= 800) rating = 'Incredible!';
    else if (calculatedScore >= 600) rating = 'Excellent!';
    else if (calculatedScore >= 400) rating = 'Good!';

    setTimeout(() => {
      onFinish({
        gameType: 'memory',
        gameTitle: 'Memory Match',
        icon: '🧠',
        score: calculatedScore,
        performance: rating,
        moves: finalMoves,
        timeSeconds: finalTime,
      });
    }, 1600);
  };

  const matchedPairsCount = cards.filter((c) => c.isMatched).length / 2;

  // Grid columns based on card count
  const gridClass =
    pairCount === 6
      ? 'grid-cols-3 gap-2.5 max-w-[280px]'
      : pairCount === 8
      ? 'grid-cols-4 gap-2.5 max-w-[340px]'
      : 'grid-cols-4 gap-2 max-w-[340px]';

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-4 relative">
      {/* Top Stats Bar */}
      <div
        className={`w-full max-w-sm rounded-2xl p-3 mb-3 flex items-center justify-around border shadow-sm ${
          darkMode
            ? 'bg-slate-900/90 border-slate-800 text-slate-200'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-center space-x-1.5">
          <Move className="w-4 h-4 text-indigo-400" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">Moves</span>
            <span className="font-bold text-sm leading-none">{moves}</span>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-700/40" />

        <div className="flex items-center space-x-1.5">
          <Clock className="w-4 h-4 text-emerald-400" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">Time</span>
            <span className="font-bold text-sm leading-none font-mono">{elapsedSeconds}s</span>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-700/40" />

        <div className="flex items-center space-x-1.5">
          <Award className="w-4 h-4 text-amber-400" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">Pairs</span>
            <span className="font-bold text-sm leading-none">
              {matchedPairsCount}/{pairCount}
            </span>
          </div>
        </div>
      </div>

      {/* Cards Board */}
      <div className={`grid ${gridClass} mx-auto my-auto select-none`}>
        {cards.map((card, index) => {
          const isRevealed = card.isFlipped || card.isMatched;
          return (
            <motion.button
              key={card.id}
              id={`memory-card-${index}`}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleCardClick(index)}
              disabled={isRevealed || isLocked}
              className={`aspect-square w-16 sm:w-18 rounded-2xl flex items-center justify-center font-bold text-2xl transition-all duration-300 relative shadow-md ${
                card.isMatched
                  ? 'bg-emerald-500/20 border-2 border-emerald-400/80 text-emerald-300 opacity-90'
                  : isRevealed
                  ? darkMode
                    ? 'bg-indigo-600/30 border-2 border-indigo-400 text-white'
                    : 'bg-indigo-100 border-2 border-indigo-500 text-slate-900'
                  : darkMode
                  ? 'bg-slate-800/90 border border-slate-700 hover:bg-slate-750 text-indigo-400'
                  : 'bg-white border border-slate-200 hover:bg-slate-100 text-indigo-500'
              }`}
            >
              {isRevealed ? (
                <motion.span
                  initial={{ scale: 0.4, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                >
                  {card.symbol}
                </motion.span>
              ) : (
                <span className="text-xl opacity-40 font-mono">?</span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Win Banner Modal overlay */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className={`p-6 rounded-3xl border w-full max-w-xs shadow-2xl ${
                darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center mx-auto mb-4 text-3xl">
                🏆
              </div>
              <h2 className="text-2xl font-black mb-1">Congratulations!</h2>
              <p className="text-sm text-slate-400 mb-4">Board completely matched</p>

              <div className="space-y-2 mb-6 text-left">
                <div className="flex justify-between py-1.5 border-b border-slate-800 text-sm">
                  <span className="text-slate-400">Moves</span>
                  <span className="font-bold">{moves}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800 text-sm">
                  <span className="text-slate-400">Time</span>
                  <span className="font-bold font-mono">{elapsedSeconds} seconds</span>
                </div>
                <div className="flex justify-between py-1.5 text-base">
                  <span className="text-indigo-400 font-semibold">Score</span>
                  <span className="font-black text-indigo-400">{finalScore}</span>
                </div>
              </div>

              <div className="text-xs text-slate-400">Calculating your brain stats...</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer controls */}
      <div className="w-full max-w-sm flex items-center space-x-3 mt-4">
        <button
          id="memory-reset-btn"
          onClick={() => {
            soundFx.playTap();
            initGame();
          }}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 transition active:scale-95 ${
            darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Board</span>
        </button>

        <button
          id="memory-home-btn"
          onClick={() => {
            soundFx.playTap();
            onHome();
          }}
          className={`py-3 px-5 rounded-xl font-semibold text-sm transition active:scale-95 ${
            darkMode ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          Home
        </button>
      </div>
    </div>
  );
};

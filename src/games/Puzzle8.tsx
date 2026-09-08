import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Clock, Move, Lightbulb, Trophy } from 'lucide-react';
import { soundFx } from '../utils/sound';
import { GameResultData } from '../types';

interface Puzzle8Props {
  onFinish: (result: Omit<GameResultData, 'xpEarned' | 'isNewBest' | 'newAchievements'>) => void;
  onHome: () => void;
  darkMode?: boolean;
}

const SOLVED_BOARD = [1, 2, 3, 4, 5, 6, 7, 8, 0];

export const Puzzle8: React.FC<Puzzle8Props> = ({ onFinish, onHome, darkMode = true }) => {
  const [board, setBoard] = useState<number[]>([...SOLVED_BOARD]);
  const [moves, setMoves] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSolving, setIsSolving] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [suggestedTile, setSuggestedTile] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Return valid neighboring indices for the empty tile (0)
  const getNeighbors = (emptyIdx: number): number[] => {
    const row = Math.floor(emptyIdx / 3);
    const col = emptyIdx % 3;
    const neighbors: number[] = [];

    if (row > 0) neighbors.push(emptyIdx - 3); // Up
    if (row < 2) neighbors.push(emptyIdx + 3); // Down
    if (col > 0) neighbors.push(emptyIdx - 1); // Left
    if (col < 2) neighbors.push(emptyIdx + 1); // Right

    return neighbors;
  };

  // Shuffle using valid random moves to guarantee solvability
  const shuffleBoard = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setMoves(0);
    setElapsedSeconds(0);
    setIsSolved(false);
    setSuggestedTile(null);

    let current = [...SOLVED_BOARD];
    let emptyIdx = 8;
    let lastMoved = -1;

    // Perform 40-50 random walk moves
    const shuffleSteps = 45;
    for (let i = 0; i < shuffleSteps; i++) {
      const neighbors = getNeighbors(emptyIdx).filter((idx) => idx !== lastMoved);
      const chosenIdx = neighbors[Math.floor(Math.random() * neighbors.length)];
      current[emptyIdx] = current[chosenIdx];
      current[chosenIdx] = 0;
      lastMoved = emptyIdx;
      emptyIdx = chosenIdx;
    }

    setBoard(current);
    setIsSolving(true);

    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
  };

  useEffect(() => {
    shuffleBoard();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleTileClick = (index: number) => {
    if (isSolved || !isSolving) return;

    const emptyIdx = board.indexOf(0);
    const neighbors = getNeighbors(emptyIdx);

    if (neighbors.includes(index)) {
      soundFx.playSlide();
      const newBoard = [...board];
      newBoard[emptyIdx] = board[index];
      newBoard[index] = 0;
      setBoard(newBoard);
      setMoves((m) => m + 1);
      setSuggestedTile(null);

      // Check if solved
      const hasWon = newBoard.every((val, idx) => val === SOLVED_BOARD[idx]);
      if (hasWon) {
        handleVictory(moves + 1, elapsedSeconds);
      }
    }
  };

  const handleVictory = (finalMoves: number, finalTime: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsSolved(true);
    setIsSolving(false);
    soundFx.playWin();

    const rawScore = Math.max(150, 1000 - finalMoves * 12 - finalTime * 4);

    let perf: 'Incredible!' | 'Excellent!' | 'Good!' | 'Average' | 'Keep Practicing' = 'Average';
    if (finalMoves <= 25) perf = 'Incredible!';
    else if (finalMoves <= 45) perf = 'Excellent!';
    else if (finalMoves <= 75) perf = 'Good!';

    setTimeout(() => {
      onFinish({
        gameType: 'puzzle',
        gameTitle: '8-Puzzle',
        icon: '🧩',
        score: rawScore,
        performance: perf,
        moves: finalMoves,
        timeSeconds: finalTime,
      });
    }, 1800);
  };

  // Provide a hint: Pick neighbor of 0 that reduces Manhattan distance to solved state
  const handleGiveHint = () => {
    if (isSolved) return;
    soundFx.playTap();
    const emptyIdx = board.indexOf(0);
    const neighbors = getNeighbors(emptyIdx);

    const calcDistance = (b: number[]) => {
      let dist = 0;
      for (let i = 0; i < 9; i++) {
        const val = b[i];
        if (val === 0) continue;
        const targetIdx = val - 1;
        const targetRow = Math.floor(targetIdx / 3);
        const targetCol = targetIdx % 3;
        const currRow = Math.floor(i / 3);
        const currCol = i % 3;
        dist += Math.abs(currRow - targetRow) + Math.abs(currCol - targetCol);
      }
      return dist;
    };

    let bestNeighbor = neighbors[0];
    let bestDist = 999;

    neighbors.forEach((nIdx) => {
      const testBoard = [...board];
      testBoard[emptyIdx] = board[nIdx];
      testBoard[nIdx] = 0;
      const d = calcDistance(testBoard);
      if (d < bestDist) {
        bestDist = d;
        bestNeighbor = nIdx;
      }
    });

    setSuggestedTile(bestNeighbor);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-4 relative select-none">
      {/* Top Banner Stats */}
      <div
        className={`w-full max-w-sm rounded-2xl p-3 flex items-center justify-around border shadow-sm ${
          darkMode ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-center space-x-1.5">
          <Move className="w-4 h-4 text-indigo-400" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">Moves</span>
            <span className="font-bold text-sm leading-none font-mono">{moves}</span>
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

        <button
          id="puzzle-hint-btn"
          onClick={handleGiveHint}
          className="flex items-center space-x-1 text-amber-400 hover:text-amber-300 transition active:scale-95"
        >
          <Lightbulb className="w-4 h-4" />
          <span className="text-xs font-bold">Hint</span>
        </button>
      </div>

      {/* 3x3 Sliding Board */}
      <div
        className={`w-[300px] h-[300px] my-auto rounded-3xl p-3 grid grid-cols-3 grid-rows-3 gap-2.5 border shadow-2xl ${
          darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-slate-200/90 border-slate-300'
        }`}
      >
        {board.map((tile, index) => {
          const isEmpty = tile === 0;
          const isSuggested = suggestedTile === index;
          const isCorrectPos = tile !== 0 && tile === SOLVED_BOARD[index];

          if (isEmpty) {
            return (
              <div
                key="empty"
                className={`rounded-2xl border-2 border-dashed ${
                  darkMode ? 'border-slate-800/80 bg-slate-950/40' : 'border-slate-300 bg-slate-100/50'
                }`}
              />
            );
          }

          return (
            <motion.button
              key={tile}
              id={`puzzle-tile-${tile}`}
              layout
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleTileClick(index)}
              className={`rounded-2xl font-mono font-black text-3xl sm:text-4xl flex items-center justify-center border-2 shadow-lg transition-colors duration-200 select-none ${
                isSuggested
                  ? 'bg-amber-500 border-amber-300 text-slate-950 ring-4 ring-amber-400/50 animate-pulse'
                  : isCorrectPos
                  ? 'bg-indigo-600/40 border-indigo-400 text-white shadow-indigo-500/20'
                  : darkMode
                  ? 'bg-slate-800 border-slate-700 hover:bg-slate-750 text-slate-100'
                  : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-800'
              }`}
            >
              <span>{tile}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Solved Victory Overlay */}
      <AnimatePresence>
        {isSolved && (
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
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/50 flex items-center justify-center mx-auto mb-4 text-3xl">
                <Trophy className="w-8 h-8 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-black mb-1">Puzzle Solved!</h2>
              <p className="text-sm text-slate-400 mb-4">You aligned all tiles perfectly</p>

              <div className="space-y-2 mb-4 text-left">
                <div className="flex justify-between py-1.5 border-b border-slate-800 text-sm">
                  <span className="text-slate-400">Moves</span>
                  <span className="font-bold font-mono">{moves}</span>
                </div>
                <div className="flex justify-between py-1.5 text-sm">
                  <span className="text-slate-400">Time</span>
                  <span className="font-bold font-mono">{elapsedSeconds} sec</span>
                </div>
              </div>

              <div className="text-xs text-indigo-400">Recording spatial score...</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="w-full max-w-sm flex items-center space-x-3 mt-4">
        <button
          id="puzzle-reshuffle-btn"
          onClick={() => {
            soundFx.playTap();
            shuffleBoard();
          }}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 transition active:scale-95 ${
            darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Shuffle</span>
        </button>

        <button
          id="puzzle-home-btn"
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

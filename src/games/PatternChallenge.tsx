import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Check, X, Clock, Award } from 'lucide-react';
import { soundFx } from '../utils/sound';
import { Difficulty, GameResultData } from '../types';

interface PatternChallengeProps {
  difficulty: Difficulty;
  onFinish: (result: Omit<GameResultData, 'xpEarned' | 'isNewBest' | 'newAchievements'>) => void;
  onHome: () => void;
  darkMode?: boolean;
}

interface Question {
  sequence: (number | string)[];
  answer: number;
  options: number[];
  ruleDescription: string;
}

export const PatternChallenge: React.FC<PatternChallengeProps> = ({
  difficulty,
  onFinish,
  onHome,
  darkMode = true,
}) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [score, setScore] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const totalQuestions = 10;

  // Generate a random question given question level (1 to 10)
  const generateQuestion = (level: number): Question => {
    const types = ['arithmetic', 'geometric', 'squares', 'fibonacci', 'alternating', 'cubes'];
    let type = 'arithmetic';

    if (level <= 2) {
      type = Math.random() > 0.5 ? 'arithmetic' : 'geometric';
    } else if (level <= 5) {
      type = ['arithmetic', 'geometric', 'squares'][Math.floor(Math.random() * 3)];
    } else if (level <= 8) {
      type = ['geometric', 'squares', 'fibonacci', 'alternating'][Math.floor(Math.random() * 4)];
    } else {
      type = types[Math.floor(Math.random() * types.length)];
    }

    let sequence: number[] = [];
    let answer = 0;
    let rule = '';

    if (type === 'arithmetic') {
      const step = Math.floor(Math.random() * 8) + 2;
      const start = Math.floor(Math.random() * 20) + 1;
      sequence = [start, start + step, start + step * 2, start + step * 3];
      answer = start + step * 4;
      rule = `+${step} each step`;
    } else if (type === 'geometric') {
      const mult = level > 6 ? 3 : 2;
      const start = Math.floor(Math.random() * 4) + 1;
      sequence = [start, start * mult, start * mult * mult, start * mult * mult * mult];
      answer = start * mult * mult * mult * mult;
      rule = `×${mult} each step`;
    } else if (type === 'squares') {
      const offset = Math.floor(Math.random() * 3); // 0, 1, 2
      const startN = Math.floor(Math.random() * 3) + 1;
      sequence = [
        startN * startN + offset,
        (startN + 1) * (startN + 1) + offset,
        (startN + 2) * (startN + 2) + offset,
        (startN + 3) * (startN + 3) + offset,
      ];
      answer = (startN + 4) * (startN + 4) + offset;
      rule = offset === 0 ? 'n² squares' : `n² + ${offset}`;
    } else if (type === 'fibonacci') {
      const a = Math.floor(Math.random() * 3) + 1;
      const b = a + Math.floor(Math.random() * 3) + 1;
      const c = a + b;
      const d = b + c;
      const e = c + d;
      sequence = [a, b, c, d];
      answer = e;
      rule = 'Sum of previous two numbers';
    } else if (type === 'alternating') {
      const add = Math.floor(Math.random() * 4) + 3;
      const sub = Math.floor(Math.random() * 2) + 1;
      const s0 = Math.floor(Math.random() * 10) + 5;
      const s1 = s0 + add;
      const s2 = s1 - sub;
      const s3 = s2 + add;
      sequence = [s0, s1, s2, s3];
      answer = s3 - sub;
      rule = `+${add}, -${sub} pattern`;
    } else {
      // Cubes / powers
      const startN = 1;
      sequence = [1, 8, 27, 64];
      answer = 125;
      rule = 'n³ cubic progression';
    }

    // Generate 3 plausible distractors
    const optionsSet = new Set<number>([answer]);
    while (optionsSet.size < 4) {
      const delta = (Math.floor(Math.random() * 7) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const fake = answer + delta;
      if (fake > 0 && fake !== answer) {
        optionsSet.add(fake);
      }
    }

    const options = Array.from(optionsSet).sort(() => 0.5 - Math.random());

    return {
      sequence: [...sequence, '?'],
      answer,
      options,
      ruleDescription: rule,
    };
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    loadNextQuestion(0);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const loadNextQuestion = (index: number) => {
    setSelectedOption(null);
    setIsAnswered(false);
    const q = generateQuestion(index + 1);
    setCurrentQuestion(q);
  };

  const handleSelectOption = (opt: number) => {
    if (isAnswered || !currentQuestion) return;
    setIsAnswered(true);
    setSelectedOption(opt);

    const isCorrect = opt === currentQuestion.answer;
    if (isCorrect) {
      soundFx.playMatchSuccess();
      const points = 100 + (difficulty === 'hard' ? 20 : 0);
      setScore((prev) => prev + points);
      setCorrectCount((prev) => prev + 1);
    } else {
      soundFx.playError();
      setWrongCount((prev) => prev + 1);
    }

    setTimeout(() => {
      const nextIdx = questionIndex + 1;
      if (nextIdx < totalQuestions) {
        setQuestionIndex(nextIdx);
        loadNextQuestion(nextIdx);
      } else {
        finishGame(isCorrect ? correctCount + 1 : correctCount);
      }
    }, 1100);
  };

  const finishGame = (finalCorrect: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const accuracy = Math.round((finalCorrect / totalQuestions) * 100);
    const finalScore = finalCorrect * 100 - Math.min(200, Math.floor(elapsedSeconds * 2));
    const normalizedScore = Math.max(100, finalScore);

    let perf: 'Incredible!' | 'Excellent!' | 'Good!' | 'Average' | 'Keep Practicing' = 'Keep Practicing';
    if (accuracy >= 90) perf = 'Incredible!';
    else if (accuracy >= 70) perf = 'Excellent!';
    else if (accuracy >= 50) perf = 'Good!';
    else if (accuracy >= 30) perf = 'Average';

    onFinish({
      gameType: 'pattern',
      gameTitle: 'Pattern Challenge',
      icon: '🔍',
      score: normalizedScore,
      performance: perf,
      accuracy,
      timeSeconds: elapsedSeconds,
    });
  };

  if (!currentQuestion) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-4 relative select-none">
      {/* Top Header info */}
      <div
        className={`w-full max-w-sm rounded-2xl p-3 flex items-center justify-between border shadow-sm ${
          darkMode ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-sm">
            Question {questionIndex + 1}/{totalQuestions}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 font-mono text-xs">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>{elapsedSeconds}s</span>
        </div>

        <div className="flex items-center space-x-1.5 font-bold text-sm text-indigo-400">
          <Award className="w-4 h-4 text-amber-400" />
          <span>{score} pts</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-sm bg-slate-800 rounded-full h-1.5 overflow-hidden my-2">
        <div
          className="bg-indigo-500 h-full transition-all duration-300"
          style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Sequence Box */}
      <div
        className={`w-full max-w-sm my-auto rounded-3xl p-6 border shadow-lg flex flex-col items-center text-center ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-3">
          Find the missing number
        </span>

        {/* Display Sequence */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 my-3">
          {currentQuestion.sequence.map((item, idx) => {
            const isTarget = item === '?';
            return (
              <motion.div
                key={idx}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={`w-13 h-13 sm:w-15 sm:h-15 rounded-2xl flex items-center justify-center font-mono font-bold text-lg sm:text-xl border shadow-sm ${
                  isTarget
                    ? 'bg-indigo-600/30 border-2 border-dashed border-indigo-400 text-indigo-300 animate-pulse'
                    : darkMode
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                {item}
              </motion.div>
            );
          })}
        </div>

        {/* Clue revealed on answer */}
        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20"
            >
              Pattern: {currentQuestion.ruleDescription}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Answer Options Grid */}
      <div className="w-full max-w-sm grid grid-cols-2 gap-3 mb-2">
        {currentQuestion.options.map((opt, idx) => {
          const isSelected = selectedOption === opt;
          const isCorrect = opt === currentQuestion.answer;

          let btnStyle = darkMode
            ? 'bg-slate-800/90 border-slate-700 hover:bg-slate-750 text-white'
            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800';

          if (isAnswered) {
            if (isCorrect) {
              btnStyle = 'bg-emerald-600 border-emerald-400 text-white shadow-emerald-500/30';
            } else if (isSelected) {
              btnStyle = 'bg-rose-600 border-rose-400 text-white';
            } else {
              btnStyle = 'opacity-40';
            }
          }

          return (
            <motion.button
              key={idx}
              id={`pattern-opt-${idx}`}
              whileTap={{ scale: 0.95 }}
              disabled={isAnswered}
              onClick={() => handleSelectOption(opt)}
              className={`py-4 px-3 rounded-2xl font-mono font-bold text-xl border-2 flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95 ${btnStyle}`}
            >
              <span>{opt}</span>
              {isAnswered && isCorrect && <Check className="w-4 h-4" />}
              {isAnswered && isSelected && !isCorrect && <X className="w-4 h-4" />}
            </motion.button>
          );
        })}
      </div>

      {/* Footer controls */}
      <div className="w-full max-w-sm flex items-center justify-between text-xs text-slate-400 px-2 mt-2">
        <button
          id="pattern-abandon-btn"
          onClick={() => {
            soundFx.playTap();
            onHome();
          }}
          className="hover:text-slate-200 py-1"
        >
          Abandon Game
        </button>
        <span>
          Accuracy: {questionIndex > 0 ? Math.round((correctCount / questionIndex) * 100) : 100}%
        </span>
      </div>
    </div>
  );
};

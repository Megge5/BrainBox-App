import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Flame, Clock, Award, Check, X } from 'lucide-react';
import { soundFx } from '../utils/sound';
import { Difficulty, GameResultData } from '../types';

interface NumberChallengeProps {
  difficulty: Difficulty;
  onFinish: (result: Omit<GameResultData, 'xpEarned' | 'isNewBest' | 'newAchievements'>) => void;
  onHome: () => void;
  darkMode?: boolean;
}

interface MathQuestion {
  prompt: string;
  answer: number;
  options: number[];
}

export const NumberChallenge: React.FC<NumberChallengeProps> = ({
  difficulty,
  onFinish,
  onHome,
  darkMode = true,
}) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(10);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const totalQuestions = 10;
  const initialTimePerQuestion = 10;

  const generateQuestion = (qNum: number): MathQuestion => {
    let prompt = '';
    let answer = 0;

    // Progression of difficulty
    if (qNum <= 3) {
      // Easy: Addition and Subtraction
      const a = Math.floor(Math.random() * 20) + 5;
      const b = Math.floor(Math.random() * 18) + 3;
      if (Math.random() > 0.5) {
        prompt = `${a} + ${b}`;
        answer = a + b;
      } else {
        const big = Math.max(a, b);
        const small = Math.min(a, b);
        prompt = `${big} − ${small}`;
        answer = big - small;
      }
    } else if (qNum <= 6) {
      // Medium: Multiplication or two-step addition
      if (Math.random() > 0.5) {
        const a = Math.floor(Math.random() * 9) + 3;
        const b = Math.floor(Math.random() * 9) + 2;
        prompt = `${a} × ${b}`;
        answer = a * b;
      } else {
        const a = Math.floor(Math.random() * 25) + 10;
        const b = Math.floor(Math.random() * 20) + 5;
        const c = Math.floor(Math.random() * 15) + 2;
        prompt = `${a} + ${b} − ${c}`;
        answer = a + b - c;
      }
    } else {
      // Hard: Mixed multiplication + addition/subtraction
      const a = Math.floor(Math.random() * 9) + 4;
      const b = Math.floor(Math.random() * 8) + 3;
      const c = Math.floor(Math.random() * 15) + 5;
      if (Math.random() > 0.5) {
        prompt = `${a} × ${b} + ${c}`;
        answer = a * b + c;
      } else {
        prompt = `${a} × ${b} − ${c}`;
        answer = a * b - c;
      }
    }

    // Options
    const optionsSet = new Set<number>([answer]);
    while (optionsSet.size < 4) {
      const delta = (Math.floor(Math.random() * 8) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const fake = answer + delta;
      if (fake !== answer) {
        optionsSet.add(fake);
      }
    }
    const options = Array.from(optionsSet).sort(() => 0.5 - Math.random());

    return { prompt: `${prompt} = ?`, answer, options };
  };

  const startNextQuestion = (qNum: number) => {
    setSelectedOption(null);
    setIsAnswered(false);
    setSecondsRemaining(initialTimePerQuestion);
    const q = generateQuestion(qNum + 1);
    setCurrentQuestion(q);
  };

  useEffect(() => {
    startNextQuestion(0);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isAnswered) return;

    timerRef.current = setInterval(() => {
      setTotalTimeSpent((t) => t + 1);
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Time out!
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAnswered, questionIndex]);

  const handleTimeout = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsAnswered(true);
    soundFx.playError();
    setStreak(0);
    setWrongCount((w) => w + 1);

    setTimeout(() => {
      advanceOrFinish(correctCount);
    }, 1200);
  };

  const handleSelectOption = (opt: number) => {
    if (isAnswered || !currentQuestion) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setIsAnswered(true);
    setSelectedOption(opt);

    const isCorrect = opt === currentQuestion.answer;
    let newCorrect = correctCount;

    if (isCorrect) {
      soundFx.playMatchSuccess();
      newCorrect += 1;
      setCorrectCount(newCorrect);

      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);

      // Scoring: base 100 + speed bonus + streak bonus
      const speedBonus = secondsRemaining * 10;
      const streakBonus = Math.min(newStreak * 15, 60);
      setScore((prev) => prev + 100 + speedBonus + streakBonus);
    } else {
      soundFx.playError();
      setStreak(0);
      setWrongCount((w) => w + 1);
    }

    setTimeout(() => {
      advanceOrFinish(newCorrect);
    }, 1000);
  };

  const advanceOrFinish = (currCorrect: number) => {
    const nextQ = questionIndex + 1;
    if (nextQ < totalQuestions) {
      setQuestionIndex(nextQ);
      startNextQuestion(nextQ);
    } else {
      finishGame(currCorrect);
    }
  };

  const finishGame = (finalCorrect: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const accuracy = Math.round((finalCorrect / totalQuestions) * 100);

    let perf: 'Incredible!' | 'Excellent!' | 'Good!' | 'Average' | 'Keep Practicing' = 'Keep Practicing';
    if (accuracy >= 90) perf = 'Incredible!';
    else if (accuracy >= 70) perf = 'Excellent!';
    else if (accuracy >= 50) perf = 'Good!';
    else if (accuracy >= 30) perf = 'Average';

    onFinish({
      gameType: 'number',
      gameTitle: 'Number Challenge',
      icon: '🔢',
      score: Math.max(100, score),
      performance: perf,
      accuracy: finalCorrect, // store count of correct answers (10 needed for Math Wizard achievement)
      streak: maxStreak,
      timeSeconds: totalTimeSpent,
    });
  };

  if (!currentQuestion) return null;

  const timerRatio = secondsRemaining / initialTimePerQuestion;

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-4 relative select-none">
      {/* Top Banner Stats */}
      <div
        className={`w-full max-w-sm rounded-2xl p-3 flex items-center justify-between border shadow-sm ${
          darkMode ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Question</span>
          <span className="font-bold text-sm">
            {questionIndex + 1}/{totalQuestions}
          </span>
        </div>

        {/* Streak Counter */}
        <div className="flex items-center space-x-1">
          <Flame className={`w-4 h-4 ${streak > 1 ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">Streak</span>
            <span className="font-bold text-sm leading-none font-mono text-amber-400">
              {streak}×
            </span>
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center space-x-1">
          <Award className="w-4 h-4 text-indigo-400" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">Score</span>
            <span className="font-bold text-sm leading-none font-mono text-indigo-400">
              {score}
            </span>
          </div>
        </div>
      </div>

      {/* Circular / Linear Countdown */}
      <div className="w-full max-w-sm my-2">
        <div className="flex items-center justify-between text-xs mb-1 px-1">
          <span className="text-slate-400 flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5" /> Time left
          </span>
          <span
            className={`font-mono font-bold ${
              secondsRemaining <= 3 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
            }`}
          >
            {secondsRemaining}s
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              secondsRemaining <= 3 ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${timerRatio * 100}%` }}
          />
        </div>
      </div>

      {/* Mental Math Question Card */}
      <div
        className={`w-full max-w-sm my-auto rounded-3xl p-8 border shadow-lg flex flex-col items-center justify-center text-center ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-4">
          Solve Fast
        </span>

        <motion.div
          key={currentQuestion.prompt}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-4xl sm:text-5xl font-black font-mono tracking-tight my-4 text-indigo-300"
        >
          {currentQuestion.prompt}
        </motion.div>
      </div>

      {/* Answer Choices (4 options) */}
      <div className="w-full max-w-sm grid grid-cols-2 gap-3 mb-3">
        {currentQuestion.options.map((opt, idx) => {
          const isSelected = selectedOption === opt;
          const isCorrect = opt === currentQuestion.answer;

          let btnStyle = darkMode
            ? 'bg-slate-800/90 border-slate-700 hover:bg-slate-750 text-white'
            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800';

          if (isAnswered) {
            if (isCorrect) {
              btnStyle = 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30';
            } else if (isSelected) {
              btnStyle = 'bg-rose-600 border-rose-400 text-white';
            } else {
              btnStyle = 'opacity-30';
            }
          }

          return (
            <motion.button
              key={idx}
              id={`number-opt-${idx}`}
              whileTap={{ scale: 0.95 }}
              disabled={isAnswered}
              onClick={() => handleSelectOption(opt)}
              className={`py-4 px-3 rounded-2xl font-mono font-bold text-2xl border-2 flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95 ${btnStyle}`}
            >
              <span>{opt}</span>
              {isAnswered && isCorrect && <Check className="w-5 h-5" />}
              {isAnswered && isSelected && !isCorrect && <X className="w-5 h-5" />}
            </motion.button>
          );
        })}
      </div>

      {/* Footer controls */}
      <div className="w-full max-w-sm flex items-center justify-between text-xs text-slate-400 px-2">
        <button
          id="number-abandon-btn"
          onClick={() => {
            soundFx.playTap();
            onHome();
          }}
          className="hover:text-slate-200 py-1"
        >
          Abandon Game
        </button>
        <span>Correct: {correctCount} / 10</span>
      </div>
    </div>
  );
};

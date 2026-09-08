import {
  Achievement,
  AppSettings,
  CategoryScores,
  GameResultData,
  GameType,
  UserProgress,
} from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_game',
    title: 'First Game',
    description: 'Play your first game.',
    icon: '🎯',
    category: 'general',
  },
  {
    id: 'streak_5',
    title: '5 Game Streak',
    description: 'Complete five games.',
    icon: '🔥',
    category: 'general',
  },
  {
    id: 'memory_master',
    title: 'Memory Master',
    description: 'Score above 900 in Memory Match.',
    icon: '🧠',
    category: 'memory',
  },
  {
    id: 'lightning',
    title: 'Lightning',
    description: 'Reaction time below 250 ms.',
    icon: '⚡',
    category: 'reaction',
  },
  {
    id: 'math_wizard',
    title: 'Math Wizard',
    description: 'Get 10 Number Challenge answers correct.',
    icon: '🔢',
    category: 'math',
  },
  {
    id: 'code_cracker',
    title: 'Code Cracker',
    description: 'Complete Code Breaker.',
    icon: '🔐',
    category: 'logic',
  },
  {
    id: 'puzzle_solver',
    title: 'Puzzle Solver',
    description: 'Solve the 8-Puzzle.',
    icon: '🧩',
    category: 'spatial',
  },
  {
    id: 'brain_champion',
    title: 'Brain Champion',
    description: 'Reach Brain Score 90.',
    icon: '🏆',
    category: 'general',
  },
];

const STORAGE_KEY_PROGRESS = 'brainbox_user_progress_v1';
const STORAGE_KEY_SETTINGS = 'brainbox_user_settings_v1';

export const INITIAL_PROGRESS: UserProgress = {
  hasSeenWelcome: false,
  totalGamesPlayed: 0,
  bestScore: 0,
  bestReactionTimeMs: null,
  xp: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  lastPlayedDate: null,
  categoryScores: {
    memory: 50,
    logic: 50,
    reaction: 50,
    math: 50,
    pattern: 50,
    spatial: 50,
  },
  gameHighScores: {
    memory: 0,
    reaction: 0,
    pattern: 0,
    number: 0,
    codebreaker: 0,
    puzzle: 0,
  },
  achievements: {},
};

export const INITIAL_SETTINGS: AppSettings = {
  sound: true,
  vibration: true,
  darkMode: true,
  difficulty: 'medium',
  deviceFrame: false,
};

// Calculate level and xp threshold: e.g. 100 * level
export function getLevelData(totalXp: number): { level: number; currentXp: number; nextLevelXp: number; progressRatio: number } {
  let level = 1;
  let remainingXp = totalXp;
  let req = 100;

  while (remainingXp >= req) {
    remainingXp -= req;
    level++;
    req = 100 + (level - 1) * 50;
  }

  return {
    level,
    currentXp: remainingXp,
    nextLevelXp: req,
    progressRatio: Math.min(1, Math.max(0, remainingXp / req)),
  };
}

// Calculate overall Brain Score (average of 6 categories)
export function getOverallBrainScore(scores: CategoryScores): number {
  const values = Object.values(scores);
  if (values.length === 0) return 50;
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.round(avg);
}

export function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROGRESS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...INITIAL_PROGRESS,
        ...parsed,
        categoryScores: {
          ...INITIAL_PROGRESS.categoryScores,
          ...(parsed.categoryScores || {}),
        },
        gameHighScores: {
          ...INITIAL_PROGRESS.gameHighScores,
          ...(parsed.gameHighScores || {}),
        },
        achievements: parsed.achievements || {},
      };
    }
  } catch {
    // Fallback
  }
  return { ...INITIAL_PROGRESS };
}

export function saveProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
  } catch {
    // Ignore storage quota
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      return { ...INITIAL_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // Fallback
  }
  return { ...INITIAL_SETTINGS };
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch {
    // Fallback
  }
}

export function recordGameResult(
  prev: UserProgress,
  result: Omit<GameResultData, 'xpEarned' | 'isNewBest' | 'newAchievements'>,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): { updatedProgress: UserProgress; gameResult: GameResultData } {
  const newGamesPlayed = prev.totalGamesPlayed + 1;
  const isNewBest = result.score > (prev.gameHighScores[result.gameType] || 0);
  const newHighScores = {
    ...prev.gameHighScores,
    [result.gameType]: Math.max(prev.gameHighScores[result.gameType] || 0, result.score),
  };
  const overallBest = Math.max(prev.bestScore, result.score);

  // Best reaction time tracking
  let newBestReactionTime = prev.bestReactionTimeMs;
  if (result.gameType === 'reaction' && result.reactionTimeMs) {
    if (newBestReactionTime === null || result.reactionTimeMs < newBestReactionTime) {
      newBestReactionTime = result.reactionTimeMs;
    }
  }

  // Base XP
  let xpGained = difficulty === 'easy' ? 25 : difficulty === 'medium' ? 40 : 60;
  if (result.performance === 'Incredible!') xpGained += 40;
  else if (result.performance === 'Excellent!') xpGained += 25;
  else if (result.performance === 'Good!') xpGained += 15;

  const newTotalXp = prev.xp + xpGained;
  const { level: newLevel } = getLevelData(newTotalXp);

  // Category mapping
  const categoryMap: Record<GameType, keyof CategoryScores> = {
    memory: 'memory',
    reaction: 'reaction',
    pattern: 'pattern',
    number: 'math',
    codebreaker: 'logic',
    puzzle: 'spatial',
  };

  const catKey = categoryMap[result.gameType];
  const prevCatScore = prev.categoryScores[catKey] || 50;

  // Compute performance score 0..100
  let targetCatScore = 50;
  if (result.gameType === 'reaction' && result.reactionTimeMs) {
    if (result.reactionTimeMs <= 200) targetCatScore = 98;
    else if (result.reactionTimeMs <= 250) targetCatScore = 92;
    else if (result.reactionTimeMs <= 300) targetCatScore = 84;
    else if (result.reactionTimeMs <= 400) targetCatScore = 72;
    else if (result.reactionTimeMs <= 500) targetCatScore = 60;
    else targetCatScore = 45;
  } else {
    // Normal scoring normalized to ~100
    targetCatScore = Math.min(99, Math.max(35, Math.round(result.score / 10)));
  }

  // Rolling update (70% prev, 30% new)
  const newCatScore = Math.min(100, Math.max(10, Math.round(prevCatScore * 0.65 + targetCatScore * 0.35)));

  const updatedCategoryScores: CategoryScores = {
    ...prev.categoryScores,
    [catKey]: newCatScore,
  };

  // Streak tracking
  const today = new Date().toISOString().split('T')[0];
  let currentStreak = prev.currentStreak;
  if (prev.lastPlayedDate !== today) {
    currentStreak += 1;
  }
  const longestStreak = Math.max(prev.longestStreak, currentStreak);

  // Check achievements
  const unlockedNow: string[] = [];
  const achievements = { ...prev.achievements };

  const tryUnlock = (id: string, condition: boolean) => {
    if (condition && !achievements[id]?.unlocked) {
      achievements[id] = { unlocked: true, unlockedAt: new Date().toISOString() };
      unlockedNow.push(id);
    }
  };

  // 1. First game
  tryUnlock('first_game', newGamesPlayed >= 1);
  // 2. 5 game streak
  tryUnlock('streak_5', newGamesPlayed >= 5);
  // 3. Memory Master
  tryUnlock('memory_master', result.gameType === 'memory' && result.score > 900);
  // 4. Lightning
  tryUnlock(
    'lightning',
    result.gameType === 'reaction' &&
      typeof result.reactionTimeMs === 'number' &&
      result.reactionTimeMs < 250
  );
  // 5. Math Wizard
  tryUnlock('math_wizard', result.gameType === 'number' && (result.accuracy ?? 0) >= 10);
  // 6. Code Cracker
  tryUnlock('code_cracker', result.gameType === 'codebreaker' && result.score > 0);
  // 7. Puzzle Solver
  tryUnlock('puzzle_solver', result.gameType === 'puzzle' && result.score > 0);
  // 8. Brain Champion
  const overallScore = getOverallBrainScore(updatedCategoryScores);
  tryUnlock('brain_champion', overallScore >= 90);

  const updatedProgress: UserProgress = {
    ...prev,
    totalGamesPlayed: newGamesPlayed,
    bestScore: overallBest,
    bestReactionTimeMs: newBestReactionTime,
    xp: newTotalXp,
    level: newLevel,
    currentStreak,
    longestStreak,
    lastPlayedDate: today,
    categoryScores: updatedCategoryScores,
    gameHighScores: newHighScores,
    achievements,
  };

  saveProgress(updatedProgress);

  const fullResult: GameResultData = {
    ...result,
    xpEarned: xpGained,
    isNewBest,
    newAchievements: unlockedNow,
  };

  return { updatedProgress, gameResult: fullResult };
}

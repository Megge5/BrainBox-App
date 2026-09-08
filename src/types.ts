export type GameType =
  | 'memory'
  | 'reaction'
  | 'pattern'
  | 'number'
  | 'codebreaker'
  | 'puzzle';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Screen =
  | 'welcome'
  | 'home'
  | 'game_memory'
  | 'game_reaction'
  | 'game_pattern'
  | 'game_number'
  | 'game_codebreaker'
  | 'game_puzzle'
  | 'results'
  | 'profile'
  | 'settings'
  | 'android_code';

export interface CategoryScores {
  memory: number;
  logic: number;
  reaction: number;
  math: number;
  pattern: number;
  spatial: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: keyof CategoryScores | 'general';
}

export interface UserProgress {
  hasSeenWelcome: boolean;
  totalGamesPlayed: number;
  bestScore: number;
  bestReactionTimeMs: number | null;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null;
  categoryScores: CategoryScores;
  gameHighScores: Record<GameType, number>;
  achievements: Record<string, { unlocked: boolean; unlockedAt?: string }>;
}

export interface AppSettings {
  sound: boolean;
  vibration: boolean;
  darkMode: boolean;
  difficulty: Difficulty;
  deviceFrame: boolean;
}

export interface GameResultData {
  gameType: GameType;
  gameTitle: string;
  icon: string;
  score: number;
  performance: 'Incredible!' | 'Excellent!' | 'Good!' | 'Average' | 'Keep Practicing';
  moves?: number;
  timeSeconds: number;
  accuracy?: number;
  streak?: number;
  reactionTimeMs?: number;
  xpEarned: number;
  isNewBest: boolean;
  newAchievements: string[];
}

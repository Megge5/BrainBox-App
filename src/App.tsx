/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AppSettings,
  GameResultData,
  GameType,
  Screen,
  UserProgress,
} from './types';
import {
  INITIAL_PROGRESS,
  loadProgress,
  loadSettings,
  recordGameResult,
  saveProgress,
  saveSettings,
} from './utils/storage';
import { soundFx } from './utils/sound';

import { AndroidDeviceFrame } from './components/AndroidDeviceFrame';
import { NavigationHeader } from './components/NavigationHeader';

import { WelcomeScreen } from './screens/WelcomeScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { AndroidCodeViewerScreen } from './screens/AndroidCodeViewerScreen';

import { MemoryMatch } from './games/MemoryMatch';
import { ReactionTest } from './games/ReactionTest';
import { PatternChallenge } from './games/PatternChallenge';
import { NumberChallenge } from './games/NumberChallenge';
import { CodeBreaker } from './games/CodeBreaker';
import { Puzzle8 } from './games/Puzzle8';

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(loadProgress);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    const saved = loadProgress();
    return saved.hasSeenWelcome ? 'home' : 'welcome';
  });

  const [activeGameType, setActiveGameType] = useState<GameType>('memory');
  const [latestResult, setLatestResult] = useState<GameResultData | null>(null);
  const [screenStack, setScreenStack] = useState<Screen[]>([]);

  // Sync sound & vibration settings with controller
  useEffect(() => {
    soundFx.setSoundEnabled(settings.sound);
    soundFx.setVibrationEnabled(settings.vibration);
  }, [settings.sound, settings.vibration]);

  const navigateTo = (screen: Screen, replace: boolean = false) => {
    if (!replace && currentScreen !== screen) {
      setScreenStack((prev) => [...prev, currentScreen]);
    }
    setCurrentScreen(screen);
  };

  const handleBack = () => {
    if (screenStack.length > 0) {
      const prev = screenStack[screenStack.length - 1];
      setScreenStack((s) => s.slice(0, -1));
      setCurrentScreen(prev);
    } else if (currentScreen !== 'home' && currentScreen !== 'welcome') {
      setCurrentScreen('home');
    }
  };

  const handleHome = () => {
    setScreenStack([]);
    setCurrentScreen('home');
  };

  const handleStartFromWelcome = () => {
    const updated: UserProgress = { ...progress, hasSeenWelcome: true };
    setProgress(updated);
    saveProgress(updated);
    setCurrentScreen('home');
  };

  const handleSelectGame = (game: GameType) => {
    setActiveGameType(game);
    const screenMap: Record<GameType, Screen> = {
      memory: 'game_memory',
      reaction: 'game_reaction',
      pattern: 'game_pattern',
      number: 'game_number',
      codebreaker: 'game_codebreaker',
      puzzle: 'game_puzzle',
    };
    navigateTo(screenMap[game]);
  };

  const handleGameFinish = (
    rawResult: Omit<GameResultData, 'xpEarned' | 'isNewBest' | 'newAchievements'>
  ) => {
    const { updatedProgress, gameResult } = recordGameResult(
      progress,
      rawResult,
      settings.difficulty
    );
    setProgress(updatedProgress);
    setLatestResult(gameResult);
    navigateTo('results');
  };

  const handlePlayAgain = () => {
    handleSelectGame(activeGameType);
  };

  const handleUpdateSettings = (partial: Partial<AppSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleResetProgress = () => {
    const reset = { ...INITIAL_PROGRESS, hasSeenWelcome: true };
    setProgress(reset);
    saveProgress(reset);
  };

  // Determine header title for games
  const getHeaderTitle = () => {
    switch (currentScreen) {
      case 'game_memory':
        return { title: 'Memory Match', subtitle: 'Find all matching pairs' };
      case 'game_reaction':
        return { title: 'Reaction Test', subtitle: 'Tap instantaneously on green' };
      case 'game_pattern':
        return { title: 'Pattern Challenge', subtitle: 'Deduce the missing number' };
      case 'game_number':
        return { title: 'Number Challenge', subtitle: 'Rapid mental arithmetic' };
      case 'game_codebreaker':
        return { title: 'Code Breaker', subtitle: 'Deduce 4 secret colors' };
      case 'game_puzzle':
        return { title: '8-Puzzle', subtitle: 'Slide tiles to 1-8 order' };
      default:
        return null;
    }
  };

  const gameHeader = getHeaderTitle();

  return (
    <AndroidDeviceFrame
      enabled={settings.deviceFrame}
      darkMode={settings.darkMode}
      onBack={handleBack}
      onHome={handleHome}
    >
      {/* Optional Top Navigation Header for Games */}
      {gameHeader && (
        <NavigationHeader
          title={gameHeader.title}
          subtitle={gameHeader.subtitle}
          onBack={handleBack}
          soundEnabled={settings.sound}
          onToggleSound={() => handleUpdateSettings({ sound: !settings.sound })}
          isDeviceFrame={settings.deviceFrame}
          onToggleDeviceFrame={() => handleUpdateSettings({ deviceFrame: !settings.deviceFrame })}
          darkMode={settings.darkMode}
        />
      )}

      {/* Screen Transitions Container */}
      <div className="flex-1 flex flex-col relative w-full overflow-y-auto">
        <AnimatePresence mode="wait">
          {currentScreen === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              <WelcomeScreen
                onStart={handleStartFromWelcome}
                darkMode={settings.darkMode}
              />
            </motion.div>
          )}

          {currentScreen === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              <HomeScreen
                progress={progress}
                onSelectGame={handleSelectGame}
                onOpenProfile={() => navigateTo('profile')}
                onOpenSettings={() => navigateTo('settings')}
                onOpenAndroidCode={() => navigateTo('android_code')}
                darkMode={settings.darkMode}
              />
            </motion.div>
          )}

          {currentScreen === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <ProfileScreen
                progress={progress}
                onBack={handleBack}
                darkMode={settings.darkMode}
              />
            </motion.div>
          )}

          {currentScreen === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <SettingsScreen
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onResetProgress={handleResetProgress}
                onBack={handleBack}
                onOpenAndroidCode={() => navigateTo('android_code')}
                darkMode={settings.darkMode}
              />
            </motion.div>
          )}

          {currentScreen === 'android_code' && (
            <motion.div
              key="android_code"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <AndroidCodeViewerScreen
                onBack={handleBack}
                darkMode={settings.darkMode}
              />
            </motion.div>
          )}

          {currentScreen === 'results' && latestResult && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              <ResultsScreen
                result={latestResult}
                progress={progress}
                onPlayAgain={handlePlayAgain}
                onHome={handleHome}
                onViewProfile={() => navigateTo('profile')}
                darkMode={settings.darkMode}
              />
            </motion.div>
          )}

          {/* Mini-Games */}
          {currentScreen === 'game_memory' && (
            <motion.div
              key="game_memory"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              <MemoryMatch
                difficulty={settings.difficulty}
                onFinish={handleGameFinish}
                onHome={handleHome}
                darkMode={settings.darkMode}
              />
            </motion.div>
          )}

          {currentScreen === 'game_reaction' && (
            <motion.div
              key="game_reaction"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              <ReactionTest
                onFinish={handleGameFinish}
                onHome={handleHome}
                darkMode={settings.darkMode}
              />
            </motion.div>
          )}

          {currentScreen === 'game_pattern' && (
            <motion.div
              key="game_pattern"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              <PatternChallenge
                difficulty={settings.difficulty}
                onFinish={handleGameFinish}
                onHome={handleHome}
                darkMode={settings.darkMode}
              />
            </motion.div>
          )}

          {currentScreen === 'game_number' && (
            <motion.div
              key="game_number"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              <NumberChallenge
                difficulty={settings.difficulty}
                onFinish={handleGameFinish}
                onHome={handleHome}
                darkMode={settings.darkMode}
              />
            </motion.div>
          )}

          {currentScreen === 'game_codebreaker' && (
            <motion.div
              key="game_codebreaker"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              <CodeBreaker
                onFinish={handleGameFinish}
                onHome={handleHome}
                darkMode={settings.darkMode}
              />
            </motion.div>
          )}

          {currentScreen === 'game_puzzle' && (
            <motion.div
              key="game_puzzle"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              <Puzzle8
                onFinish={handleGameFinish}
                onHome={handleHome}
                darkMode={settings.darkMode}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AndroidDeviceFrame>
  );
}

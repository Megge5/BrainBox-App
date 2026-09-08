import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Copy, Check, FileCode, Folder, Terminal, Download } from 'lucide-react';
import { soundFx } from '../utils/sound';

interface AndroidCodeViewerScreenProps {
  onBack: () => void;
  darkMode?: boolean;
}

interface CodeFile {
  path: string;
  name: string;
  language: string;
  description: string;
  content: string;
}

const ANDROID_FILES: CodeFile[] = [
  {
    path: 'build-apk.sh',
    name: 'build-apk.sh (APK Builder)',
    language: 'bash',
    description: 'Universal Bash APK builder script for Linux, macOS & WSL',
    content: `#!/usr/bin/env bash
# BrainBox Android APK Builder Script
# Usage: ./build-apk.sh [debug|release|docker]
set -e

BUILD_MODE="\${1:-debug}"
SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
ANDROID_DIR="$SCRIPT_DIR/android"
OUTPUT_DIR="$SCRIPT_DIR/dist-apk"

echo "🧠 BrainBox Android APK Builder..."

if [ "$BUILD_MODE" == "docker" ]; then
    echo "Running containerized build with Dockerfile.apk..."
    docker build -f "$SCRIPT_DIR/Dockerfile.apk" -t brainbox-apk-builder "$SCRIPT_DIR"
    CONTAINER_ID=$(docker create brainbox-apk-builder)
    mkdir -p "$OUTPUT_DIR"
    docker cp "$CONTAINER_ID:/app/BrainBox-debug.apk" "$OUTPUT_DIR/BrainBox-debug.apk"
    docker rm -v "$CONTAINER_ID" > /dev/null
    echo "✔ Success! APK: $OUTPUT_DIR/BrainBox-debug.apk"
    exit 0
fi

cd "$ANDROID_DIR"
chmod +x gradlew || true

if [ "$BUILD_MODE" == "release" ]; then
    ./gradlew assembleRelease
    OUTPUT_NAME="BrainBox-release.apk"
    SRC="$ANDROID_DIR/app/build/outputs/apk/release/app-release-unsigned.apk"
else
    ./gradlew assembleDebug
    OUTPUT_NAME="BrainBox-debug.apk"
    SRC="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"
fi

mkdir -p "$OUTPUT_DIR"
cp "$SRC" "$OUTPUT_DIR/$OUTPUT_NAME"
echo "✔ APK Built successfully at: $OUTPUT_DIR/$OUTPUT_NAME"
echo "To install on Android phone: adb install -r $OUTPUT_DIR/$OUTPUT_NAME"`,
  },
  {
    path: 'Dockerfile.apk',
    name: 'Dockerfile.apk (Docker Builder)',
    language: 'dockerfile',
    description: 'Docker containerized APK builder (no local Android SDK required)',
    content: `# BrainBox Android APK Docker Builder
FROM eclipse-temurin:17-jdk-jammy AS builder

ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

RUN apt-get update && apt-get install -y --no-install-recommends \\
    wget unzip git curl && rm -rf /var/lib/apt/lists/*

RUN mkdir -p \${ANDROID_HOME}/cmdline-tools && \\
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O /tmp/cmdline-tools.zip && \\
    unzip -q /tmp/cmdline-tools.zip -d \${ANDROID_HOME}/cmdline-tools && \\
    mv \${ANDROID_HOME}/cmdline-tools/cmdline-tools \${ANDROID_HOME}/cmdline-tools/latest && \\
    rm /tmp/cmdline-tools.zip

RUN yes | sdkmanager --licenses > /dev/null && \\
    sdkmanager --install "platform-tools" "platforms;android-35" "build-tools;35.0.0"

WORKDIR /app
COPY android/ /app/android/
WORKDIR /app/android
RUN chmod +x gradlew || true
RUN ./gradlew assembleDebug --no-daemon

RUN find /app/android/app/build/outputs/apk/ -name "*.apk" -exec cp {} /app/BrainBox-debug.apk \\;

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/BrainBox-debug.apk /app/BrainBox-debug.apk
CMD ["cp", "/app/BrainBox-debug.apk", "/out/"]`,
  },
  {
    path: '.github/workflows/build-apk.yml',
    name: 'build-apk.yml (GitHub Actions)',
    language: 'yaml',
    description: 'Cloud CI workflow to automatically build and export the APK on GitHub',
    content: `name: Build Android APK
on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build:
    name: Build BrainBox APK
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
          cache: 'gradle'
      - uses: android-actions/setup-android@v3
      - name: Build Debug APK
        working-directory: android
        run: |
          chmod +x gradlew
          ./gradlew assembleDebug
      - name: Upload BrainBox APK
        uses: actions/upload-artifact@v4
        with:
          name: BrainBox-debug-apk
          path: android/app/build/outputs/apk/debug/*.apk`,
  },
  {
    path: 'android/app/build.gradle.kts',
    name: 'build.gradle.kts (App)',
    language: 'kotlin',
    description: 'Android app Gradle configuration with Jetpack Compose, Material3, and DataStore',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.example.brainbox"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.example.brainbox"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:2024.12.01"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3:1.3.1")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.navigation:navigation-compose:2.8.5")
    implementation("androidx.datastore:datastore-preferences:1.1.1")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
    debugImplementation("androidx.compose.ui:ui-tooling")
}`,
  },
  {
    path: 'android/app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    language: 'xml',
    description: 'Android Manifest declaring BrainBox activity and vibration permission',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="BrainBox"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.BrainBox">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="BrainBox"
            android:theme="@style/Theme.BrainBox">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>`,
  },
  {
    path: 'com/example/brainbox/MainActivity.kt',
    name: 'MainActivity.kt',
    language: 'kotlin',
    description: 'Main Jetpack Compose entry point and Navigation graph',
    content: `package com.example.brainbox

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.brainbox.ui.screens.*
import com.example.brainbox.ui.theme.BrainBoxTheme
import com.example.brainbox.viewmodel.BrainBoxViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            BrainBoxTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    val viewModel: BrainBoxViewModel = viewModel()
                    val progress by viewModel.userProgress.collectAsState()

                    NavHost(
                        navController = navController,
                        startDestination = if (progress.hasSeenWelcome) "home" else "welcome"
                    ) {
                        composable("welcome") {
                            WelcomeScreen(onStart = {
                                viewModel.markWelcomeSeen()
                                navController.navigate("home") {
                                    popUpTo("welcome") { inclusive = true }
                                }
                            })
                        }
                        composable("home") {
                            HomeScreen(
                                progress = progress,
                                onSelectGame = { gameType -> navController.navigate("game/$gameType") },
                                onOpenProfile = { navController.navigate("profile") },
                                onOpenSettings = { navController.navigate("settings") }
                            )
                        }
                        composable("profile") {
                            ProfileScreen(
                                progress = progress,
                                onBack = { navController.popBackStack() }
                            )
                        }
                        composable("settings") {
                            SettingsScreen(
                                onReset = { viewModel.resetProgress() },
                                onBack = { navController.popBackStack() }
                            )
                        }
                        composable("game/{gameType}") { backStackEntry ->
                            val gameType = backStackEntry.arguments?.getString("gameType") ?: "memory"
                            GameContainerScreen(
                                gameType = gameType,
                                onFinished = { result ->
                                    viewModel.recordResult(result)
                                    navController.navigate("results")
                                },
                                onHome = { navController.navigate("home") }
                            )
                        }
                    }
                }
            }
        }
    }
}`,
  },
  {
    path: 'com/example/brainbox/data/BrainBoxDataStore.kt',
    name: 'BrainBoxDataStore.kt',
    language: 'kotlin',
    description: 'Local DataStore persistence for offline Brain Score, XP, and High Scores',
    content: `package com.example.brainbox.data

import android.content.Context
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import com.example.brainbox.model.UserProgress
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore by preferencesDataStore(name = "brainbox_prefs")

class BrainBoxDataStore(private val context: Context) {
    companion object {
        val TOTAL_GAMES = intPreferencesKey("total_games")
        val BEST_SCORE = intPreferencesKey("best_score")
        val BEST_REACTION_MS = intPreferencesKey("best_reaction_ms")
        val XP = intPreferencesKey("xp")
        val LEVEL = intPreferencesKey("level")
        val WELCOME_SEEN = booleanPreferencesKey("welcome_seen")
        val MEMORY_SCORE = intPreferencesKey("score_memory")
        val LOGIC_SCORE = intPreferencesKey("score_logic")
        val REACTION_SCORE = intPreferencesKey("score_reaction")
        val MATH_SCORE = intPreferencesKey("score_math")
        val PATTERN_SCORE = intPreferencesKey("score_pattern")
        val SPATIAL_SCORE = intPreferencesKey("score_spatial")
    }

    val userProgressFlow: Flow<UserProgress> = context.dataStore.data.map { prefs ->
        UserProgress(
            hasSeenWelcome = prefs[WELCOME_SEEN] ?: false,
            totalGamesPlayed = prefs[TOTAL_GAMES] ?: 0,
            bestScore = prefs[BEST_SCORE] ?: 0,
            bestReactionTimeMs = prefs[BEST_REACTION_MS],
            xp = prefs[XP] ?: 0,
            level = prefs[LEVEL] ?: 1,
            memoryScore = prefs[MEMORY_SCORE] ?: 50,
            logicScore = prefs[LOGIC_SCORE] ?: 50,
            reactionScore = prefs[REACTION_SCORE] ?: 50,
            mathScore = prefs[MATH_SCORE] ?: 50,
            patternScore = prefs[PATTERN_SCORE] ?: 50,
            spatialScore = prefs[SPATIAL_SCORE] ?: 50
        )
    }

    suspend fun saveProgress(progress: UserProgress) {
        context.dataStore.edit { prefs ->
            prefs[TOTAL_GAMES] = progress.totalGamesPlayed
            prefs[BEST_SCORE] = progress.bestScore
            progress.bestReactionTimeMs?.let { prefs[BEST_REACTION_MS] = it }
            prefs[XP] = progress.xp
            prefs[LEVEL] = progress.level
            prefs[WELCOME_SEEN] = progress.hasSeenWelcome
            prefs[MEMORY_SCORE] = progress.memoryScore
            prefs[LOGIC_SCORE] = progress.logicScore
            prefs[REACTION_SCORE] = progress.reactionScore
            prefs[MATH_SCORE] = progress.mathScore
            prefs[PATTERN_SCORE] = progress.patternScore
            prefs[SPATIAL_SCORE] = progress.spatialScore
        }
    }

    suspend fun clearAll() {
        context.dataStore.edit { it.clear() }
    }
}`,
  },
  {
    path: 'com/example/brainbox/games/GameLogic.kt',
    name: 'GameLogic.kt',
    language: 'kotlin',
    description: 'Kotlin game algorithms for Memory, Reaction, Patterns, Math, CodeBreaker, 8-Puzzle',
    content: `package com.example.brainbox.games

import kotlin.math.max
import kotlin.random.Random

object GameLogic {
    // 1. Memory Match formula: score = max(1000 - moves * 20 - elapsedSeconds * 5, 100)
    fun calculateMemoryScore(moves: Int, elapsedSeconds: Int): Int {
        return max(1000 - moves * 20 - elapsedSeconds * 5, 100)
    }

    // 2. Reaction rating categories (<200ms Incredible, 200-300ms Excellent, etc.)
    fun evaluateReactionRating(timeMs: Long): String {
        return when {
            timeMs < 200 -> "Incredible"
            timeMs <= 300 -> "Excellent"
            timeMs <= 400 -> "Good"
            timeMs <= 500 -> "Average"
            else -> "Keep Practicing"
        }
    }

    // 3. Solvable 8-Puzzle generator using random walk
    fun generateSolvable8Puzzle(): List<Int> {
        val board = mutableListOf(1, 2, 3, 4, 5, 6, 7, 8, 0)
        var emptyPos = 8
        var lastMoved = -1

        repeat(45) {
            val neighbors = getPuzzleNeighbors(emptyPos).filter { it != lastMoved }
            val chosen = neighbors.random()
            board[emptyPos] = board[chosen]
            board[chosen] = 0
            lastMoved = emptyPos
            emptyPos = chosen
        }
        return board
    }

    private fun getPuzzleNeighbors(empty: Int): List<Int> {
        val row = empty / 3
        val col = empty % 3
        val result = mutableListOf<Int>()
        if (row > 0) result.add(empty - 3)
        if (row < 2) result.add(empty + 3)
        if (col > 0) result.add(empty - 1)
        if (col < 2) result.add(empty + 1)
        return result
    }

    // 4. Code Breaker clues: exact (●), partial (○), miss (✕)
    data class CodeClues(val exact: Int, val partial: Int, val miss: Int)

    fun evaluateCodeGuess(secret: List<String>, guess: List<String>): CodeClues {
        var exact = 0
        var partial = 0
        val sCopy = secret.toMutableList()
        val gCopy = guess.toMutableList()

        for (i in 0 until 4) {
            if (gCopy[i] == sCopy[i]) {
                exact++
                sCopy[i] = "MATCH"
                gCopy[i] = "MATCH_G"
            }
        }
        for (i in 0 until 4) {
            if (gCopy[i] != "MATCH_G") {
                val idx = sCopy.indexOf(gCopy[i])
                if (idx != -1) {
                    partial++
                    sCopy[idx] = "PARTIAL"
                }
            }
        }
        return CodeClues(exact, partial, 4 - (exact + partial))
    }
}`,
  },
];

export const AndroidCodeViewerScreen: React.FC<AndroidCodeViewerScreenProps> = ({
  onBack,
  darkMode = true,
}) => {
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentFile = ANDROID_FILES[selectedFileIdx];

  const handleCopy = () => {
    soundFx.playTap();
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    soundFx.playTap();
    const blob = new Blob([currentFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFile.path.split('/').pop() || 'file';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyCommand = (cmd: string) => {
    soundFx.playTap();
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full select-none space-y-4 pb-8 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center space-x-3 pt-1">
        <button
          id="codeviewer-back-btn"
          onClick={() => {
            soundFx.playTap();
            onBack();
          }}
          className={`p-2 rounded-xl active:scale-95 transition ${
            darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-100">Native Android Project</h1>
          <p className="text-xs text-slate-400">Kotlin & Jetpack Compose Source</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 space-y-1">
        <div className="flex items-center space-x-1.5 font-bold text-indigo-300">
          <Terminal className="w-4 h-4" />
          <span>Android Studio Ready</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          The complete Gradle, Manifest, and Kotlin Compose architecture files are generated below. You can copy or inspect each source file directly.
        </p>
      </div>

      {/* File Selector Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        {ANDROID_FILES.map((file, idx) => {
          const isSelected = idx === selectedFileIdx;
          return (
            <button
              key={file.name}
              id={`android-file-tab-${idx}`}
              onClick={() => {
                soundFx.playTap();
                setSelectedFileIdx(idx);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1.5 border active:scale-95 shrink-0 ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{file.name}</span>
            </button>
          );
        })}
      </div>

      {/* File Detail and Code Box */}
      <div className="rounded-3xl p-4 bg-slate-900/90 border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-mono text-slate-400 block truncate">
              {currentFile.path}
            </span>
            <span className="text-xs text-slate-300 font-medium">{currentFile.description}</span>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0 ml-2">
            <button
              id="android-download-code-btn"
              onClick={handleDownload}
              title="Download File"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition active:scale-95 flex items-center space-x-1 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save</span>
            </button>
            <button
              id="android-copy-code-btn"
              onClick={handleCopy}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition active:scale-95 flex items-center space-x-1 text-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Content Container */}
        <div className="relative rounded-2xl bg-slate-950 p-3 border border-slate-800/80 overflow-x-auto max-h-[360px]">
          <pre className="text-[11px] font-mono text-slate-300 leading-relaxed select-text">
            {currentFile.content}
          </pre>
        </div>
      </div>

      {/* Quick APK Build Commands Card */}
      <div className="rounded-3xl p-4 bg-slate-900/90 border border-indigo-900/40 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Quick APK Build Commands
            </h3>
          </div>
          <span className="text-[10px] text-indigo-400 font-semibold">Click command to copy</span>
        </div>

        <div className="space-y-2">
          {[
            {
              label: '1. Local Build Script (Linux/macOS)',
              cmd: './build-apk.sh debug',
              desc: 'Uses Gradle wrapper to build BrainBox-debug.apk',
            },
            {
              label: '2. Isolated Docker Build (Zero SDK Setup)',
              cmd: 'docker build -f Dockerfile.apk -t brainbox-apk .',
              desc: 'Builds inside Docker container with Android 35 SDK',
            },
            {
              label: '3. NPM Shortcut Command',
              cmd: 'npm run build:apk',
              desc: 'Runs root build-apk.sh pipeline',
            },
            {
              label: '4. Android Studio IDE',
              cmd: 'Open /android in Android Studio > Build > Build APK(s)',
              desc: 'Direct GUI build with emulator testing',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => copyCommand(item.cmd)}
              className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition active:scale-98 group"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">{item.label}</span>
                <span className="text-[10px] text-indigo-400 group-hover:underline">
                  {copiedCmd === item.cmd ? '✔ Copied!' : 'Copy'}
                </span>
              </div>
              <code className="text-xs font-mono text-indigo-300 block mt-1 font-semibold truncate">
                {item.cmd}
              </code>
              <span className="text-[10px] text-slate-500 block mt-0.5">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

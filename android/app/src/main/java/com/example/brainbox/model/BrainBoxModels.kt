package com.example.brainbox.model

enum class GameType(val displayName: String, val category: String, val icon: String) {
    MEMORY("Memory Match", "Memory", "🧠"),
    REACTION("Reaction Test", "Reaction", "⚡"),
    PATTERN("Pattern Challenge", "Pattern", "🔍"),
    NUMBER("Number Challenge", "Math", "🔢"),
    CODEBREAKER("Code Breaker", "Logic", "🔐"),
    PUZZLE("8-Puzzle", "Spatial", "🧩")
}

data class CategoryScores(
    val memory: Int = 50,
    val logic: Int = 50,
    val reaction: Int = 50,
    val math: Int = 50,
    val pattern: Int = 50,
    val spatial: Int = 50
) {
    fun overallBrainScore(): Int {
        return (memory + logic + reaction + math + pattern + spatial) / 6
    }
}

data class UserProgress(
    val hasSeenWelcome: Boolean = false,
    val totalGamesPlayed: Int = 0,
    val bestScore: Int = 0,
    val bestReactionTimeMs: Long? = null,
    val xp: Int = 0,
    val level: Int = 1,
    val currentStreak: Int = 0,
    val longestStreak: Int = 0,
    val categoryScores: CategoryScores = CategoryScores(),
    val highScores: Map<GameType, Int> = emptyMap(),
    val unlockedAchievements: Set<String> = emptySet()
)

data class GameResult(
    val gameType: GameType,
    val score: Int,
    val performance: String,
    val moves: Int? = null,
    val timeSeconds: Int = 0,
    val reactionTimeMs: Long? = null,
    val accuracy: Int? = null,
    val streak: Int? = null,
    val xpEarned: Int = 0,
    val isNewBest: Boolean = false
)

data class Achievement(
    val id: String,
    val title: String,
    val description: String,
    val icon: String
)

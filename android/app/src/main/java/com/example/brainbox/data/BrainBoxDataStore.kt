package com.example.brainbox.data

import android.content.Context
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import com.example.brainbox.model.CategoryScores
import com.example.brainbox.model.UserProgress
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore by preferencesDataStore(name = "brainbox_preferences")

class BrainBoxDataStore(private val context: Context) {
    companion object {
        val TOTAL_GAMES = intPreferencesKey("total_games")
        val BEST_SCORE = intPreferencesKey("best_score")
        val BEST_REACTION_MS = longPreferencesKey("best_reaction_ms")
        val XP = intPreferencesKey("xp")
        val LEVEL = intPreferencesKey("level")
        val WELCOME_SEEN = booleanPreferencesKey("welcome_seen")
        val SCORE_MEMORY = intPreferencesKey("score_memory")
        val SCORE_LOGIC = intPreferencesKey("score_logic")
        val SCORE_REACTION = intPreferencesKey("score_reaction")
        val SCORE_MATH = intPreferencesKey("score_math")
        val SCORE_PATTERN = intPreferencesKey("score_pattern")
        val SCORE_SPATIAL = intPreferencesKey("score_spatial")
    }

    val userProgressFlow: Flow<UserProgress> = context.dataStore.data.map { prefs ->
        UserProgress(
            hasSeenWelcome = prefs[WELCOME_SEEN] ?: false,
            totalGamesPlayed = prefs[TOTAL_GAMES] ?: 0,
            bestScore = prefs[BEST_SCORE] ?: 0,
            bestReactionTimeMs = prefs[BEST_REACTION_MS],
            xp = prefs[XP] ?: 0,
            level = prefs[LEVEL] ?: 1,
            categoryScores = CategoryScores(
                memory = prefs[SCORE_MEMORY] ?: 50,
                logic = prefs[SCORE_LOGIC] ?: 50,
                reaction = prefs[SCORE_REACTION] ?: 50,
                math = prefs[SCORE_MATH] ?: 50,
                pattern = prefs[SCORE_PATTERN] ?: 50,
                spatial = prefs[SCORE_SPATIAL] ?: 50
            )
        )
    }

    suspend fun saveProgress(progress: UserProgress) {
        context.dataStore.edit { prefs ->
            prefs[WELCOME_SEEN] = progress.hasSeenWelcome
            prefs[TOTAL_GAMES] = progress.totalGamesPlayed
            prefs[BEST_SCORE] = progress.bestScore
            progress.bestReactionTimeMs?.let { prefs[BEST_REACTION_MS] = it }
            prefs[XP] = progress.xp
            prefs[LEVEL] = progress.level
            prefs[SCORE_MEMORY] = progress.categoryScores.memory
            prefs[SCORE_LOGIC] = progress.categoryScores.logic
            prefs[SCORE_REACTION] = progress.categoryScores.reaction
            prefs[SCORE_MATH] = progress.categoryScores.math
            prefs[SCORE_PATTERN] = progress.categoryScores.pattern
            prefs[SCORE_SPATIAL] = progress.categoryScores.spatial
        }
    }

    suspend fun resetAll() {
        context.dataStore.edit { it.clear() }
    }
}

package com.example.brainbox.games

import kotlin.math.max

object GameEngines {
    // Memory scoring: score = max(1000 - moves * 20 - elapsedSeconds * 5, 100)
    fun computeMemoryScore(moves: Int, elapsedSeconds: Int): Int {
        return max(1000 - moves * 20 - elapsedSeconds * 5, 100)
    }

    // Reaction rating
    fun reactionRating(ms: Long): String {
        return when {
            ms < 200 -> "Incredible!"
            ms <= 300 -> "Excellent!"
            ms <= 400 -> "Good!"
            ms <= 500 -> "Average"
            else -> "Keep Practicing"
        }
    }

    // 8-Puzzle solvable random-walk generator
    fun generateSolvable8Puzzle(): List<Int> {
        val board = mutableListOf(1, 2, 3, 4, 5, 6, 7, 8, 0)
        var emptyIdx = 8
        var lastMoved = -1

        repeat(50) {
            val valid = getNeighbors(emptyIdx).filter { it != lastMoved }
            val chosen = valid.random()
            board[emptyIdx] = board[chosen]
            board[chosen] = 0
            lastMoved = emptyIdx
            emptyIdx = chosen
        }
        return board
    }

    private fun getNeighbors(empty: Int): List<Int> {
        val row = empty / 3
        val col = empty % 3
        val list = mutableListOf<Int>()
        if (row > 0) list.add(empty - 3)
        if (row < 2) list.add(empty + 3)
        if (col > 0) list.add(empty - 1)
        if (col < 2) list.add(empty + 1)
        return list
    }

    // Code Breaker Clues: exact (●), partial (○), miss (✕)
    data class ClueResult(val exact: Int, val partial: Int, val miss: Int)

    fun evaluateGuess(secret: List<String>, guess: List<String>): ClueResult {
        var exact = 0
        var partial = 0
        val sList = secret.toMutableList()
        val gList = guess.toMutableList()

        for (i in 0 until 4) {
            if (gList[i] == sList[i]) {
                exact++
                sList[i] = "MATCH"
                gList[i] = "MATCH_G"
            }
        }
        for (i in 0 until 4) {
            if (gList[i] != "MATCH_G") {
                val idx = sList.indexOf(gList[i])
                if (idx != -1) {
                    partial++
                    sList[idx] = "PARTIAL"
                }
            }
        }
        return ClueResult(exact, partial, 4 - (exact + partial))
    }
}

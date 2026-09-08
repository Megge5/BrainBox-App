package com.example.brainbox

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.brainbox.data.BrainBoxDataStore
import com.example.brainbox.model.UserProgress
import com.example.brainbox.ui.screens.HomeScreen
import com.example.brainbox.ui.theme.BrainBoxTheme

class MainActivity : ComponentActivity() {
    private lateinit var dataStore: BrainBoxDataStore

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        dataStore = BrainBoxDataStore(applicationContext)
        enableEdgeToEdge()

        setContent {
            BrainBoxTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val progress by dataStore.userProgressFlow.collectAsState(initial = UserProgress())
                    val navController = rememberNavController()

                    NavHost(
                        navController = navController,
                        startDestination = "home"
                    ) {
                        composable("home") {
                            HomeScreen(
                                progress = progress,
                                onSelectGame = { game ->
                                    navController.navigate("game/${game.name.lowercase()}")
                                },
                                onOpenProfile = {
                                    navController.navigate("profile")
                                },
                                onOpenSettings = {
                                    navController.navigate("settings")
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}

import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, AppState, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useCallback, useEffect, useRef, useState } from "react";
import { OpeningScreen } from "./components/OpeningScreen";
import { useAppData } from "./hooks/useAppData";
import { useMusicSettings } from "./hooks/useMusicSettings";
import { HomeScreen } from "./screens/HomeScreen";
import { TrainingScreen } from "./screens/TrainingScreen";
import { TrainingHistoryScreen } from "./screens/TrainingHistoryScreen";
import { ExerciseHistoryScreen } from "./screens/ExerciseHistoryScreen";
import { WeightScreen } from "./screens/WeightScreen";
import { MealScreen } from "./screens/MealScreen";
import { ChatScreen } from "./screens/ChatScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { musicManager } from "./services/musicManager";
import { ScreenName } from "./types";
import { colors } from "./constants/theme";

type AppPhase = "loading" | "opening" | "main";

function countWorkoutProgress(
  completedIds: string[],
  exerciseIds: string[]
): { completed: number; total: number; progress: number } {
  const idSet = new Set(exerciseIds);
  const completed = completedIds.filter((id) => idSet.has(id)).length;
  const total = exerciseIds.length;
  const progress = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  return { completed, total, progress };
}

export default function App() {
  const [screen, setScreen] = useState<ScreenName>("home");
  const [appPhase, setAppPhase] = useState<AppPhase>("loading");
  const [historyExercise, setHistoryExercise] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [exerciseHistoryBack, setExerciseHistoryBack] = useState<ScreenName>("training");

  const {
    data,
    loading,
    addWeight,
    addMeal,
    deleteMeal,
    toggleExercise,
    saveExerciseLog,
    sendChat,
    updateSettings,
    clearChatHistory,
    resetAllData,
    getTodayTrainingLog,
    getTodayExerciseLog,
    getPreviousExerciseLog,
    getLatestWeight,
    getTodayMeals,
    getTrainingHistory,
    getExercise1RMHistory,
    getExerciseHistory,
    getSessionDetailsForDate,
    getResolvedTodayWorkout,
    getDefaultWorkoutForToday,
    getIsTodayWorkoutOverridden,
    setTodayWorkoutOverride,
    clearTodayWorkoutOverride,
  } = useAppData();

  const { settings: musicSettings, loaded: musicLoaded, updateSettings: updateMusicSettings } =
    useMusicSettings();

  const [openingExitRequested, setOpeningExitRequested] = useState(false);
  const [openingProgress, setOpeningProgress] = useState(0);
  const [openingDurationSec, setOpeningDurationSec] = useState(0);
  const openingStartedRef = useRef(false);
  const openingExitStartedRef = useRef(false);

  useEffect(() => {
    if (!loading && data && musicLoaded && appPhase === "loading") {
      openingStartedRef.current = false;
      openingExitStartedRef.current = false;
      setOpeningExitRequested(false);
      setOpeningProgress(0);
      setOpeningDurationSec(0);
      void (async () => {
        await musicManager.initialize(musicSettings);
        setAppPhase("opening");
      })();
    }
  }, [loading, data, musicLoaded, musicSettings, appPhase]);

  useEffect(() => {
    if (appPhase !== "opening") return;

    return () => {
      musicManager.cancelOpening();
      openingStartedRef.current = false;
    };
  }, [appPhase]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      musicManager.handleAppStateChange(nextState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleOpeningComplete = useCallback(async () => {
    await musicManager.releaseAfterOpening();
    openingStartedRef.current = false;
    openingExitStartedRef.current = false;
    setOpeningExitRequested(false);
    setOpeningProgress(0);
    setOpeningDurationSec(0);
    setAppPhase("main");
    void musicManager.startBgmLoop();
  }, []);

  const requestOpeningExit = useCallback(() => {
    if (openingExitStartedRef.current) return;
    openingExitStartedRef.current = true;
    setOpeningExitRequested(true);
  }, []);

  const handleOpeningSkip = useCallback(async () => {
    if (openingExitStartedRef.current) return;
    openingExitStartedRef.current = true;

    if (musicSettings.enabled) {
      await musicManager.skipOpeningFadeOut(400);
    }

    setOpeningExitRequested(true);
  }, [musicSettings.enabled]);

  const handleOpeningReady = useCallback(() => {
    if (openingStartedRef.current) return;
    openingStartedRef.current = true;

    if (!musicSettings.enabled) return;

    void musicManager.playOpeningFull({
      onProgress: (currentSec, durationSec) => {
        if (durationSec > 0) {
          setOpeningDurationSec(durationSec);
          setOpeningProgress(currentSec / durationSec);
        }
      },
      onFinished: () => {
        requestOpeningExit();
      },
    });
  }, [musicSettings.enabled, requestOpeningExit]);

  const handleStartTraining = useCallback(() => {
    setScreen("training");
  }, []);

  const handlePersonalRecord = useCallback(() => {
    void musicManager.playCue("pr_celebration", {
      dedupeKey: "pr-celebration",
      dedupeMs: 5000,
    });
  }, []);

  const openExerciseHistory = (id: string, name: string, back: ScreenName = "training") => {
    setHistoryExercise({ id, name });
    setExerciseHistoryBack(back);
    setScreen("exerciseHistory");
  };

  if (appPhase === "loading" || !data) {
    return (
      <SafeAreaProvider>
        <View style={styles.loading}>
          <StatusBar style="light" />
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaProvider>
    );
  }

  if (appPhase === "opening") {
    return (
      <SafeAreaProvider>
        <View style={styles.root}>
          <StatusBar style="light" />
          <OpeningScreen
            onComplete={handleOpeningComplete}
            onReady={handleOpeningReady}
            onSkip={handleOpeningSkip}
            musicEnabled={musicSettings.enabled}
            exitRequested={openingExitRequested}
            playbackProgress={openingProgress}
            songDurationSec={openingDurationSec}
          />
        </View>
      </SafeAreaProvider>
    );
  }

  const workout = getResolvedTodayWorkout();
  const defaultWorkout = getDefaultWorkoutForToday();
  const trainingLog = getTodayTrainingLog(workout.id);
  const { progress: trainingProgress } = countWorkoutProgress(
    trainingLog?.completedExercises ?? [],
    workout.exercises.map((e) => e.id)
  );

  return (
    <SafeAreaProvider>
    <View style={styles.root}>
      <StatusBar style="light" />

      {screen === "home" && (
        <HomeScreen
          onNavigate={setScreen}
          onStartTraining={handleStartTraining}
          latestWeight={getLatestWeight()}
          todayMeals={getTodayMeals()}
          settings={data.settings}
          trainingProgress={trainingProgress}
          todayWorkout={workout}
          isWorkoutOverridden={getIsTodayWorkoutOverridden()}
        />
      )}

      {screen === "training" && (
        <TrainingScreen
          workout={workout}
          defaultWorkout={defaultWorkout}
          isWorkoutOverridden={getIsTodayWorkoutOverridden()}
          onChangeWorkout={setTodayWorkoutOverride}
          onResetWorkout={clearTodayWorkoutOverride}
          onBack={() => setScreen("home")}
          onOpenHistory={() => setScreen("trainingHistory")}
          onOpenExerciseHistory={openExerciseHistory}
          completedIds={trainingLog?.completedExercises ?? []}
          onToggleExercise={(id) => toggleExercise(workout.id, id)}
          getTodayExerciseLog={(id) => getTodayExerciseLog(workout.id, id)}
          getPreviousExerciseLog={getPreviousExerciseLog}
          onSaveExerciseLog={(id, name, sets) =>
            saveExerciseLog(workout.id, id, name, sets)
          }
          onPersonalRecord={handlePersonalRecord}
        />
      )}

      {screen === "trainingHistory" && (
        <TrainingHistoryScreen
          onBack={() => setScreen("training")}
          sessions={getTrainingHistory()}
          onOpenExercise={(id, name) => openExerciseHistory(id, name, "trainingHistory")}
          getSessionDetails={getSessionDetailsForDate}
        />
      )}

      {screen === "exerciseHistory" && historyExercise && (
        <ExerciseHistoryScreen
          onBack={() => setScreen(exerciseHistoryBack)}
          exerciseName={historyExercise.name}
          oneRMHistory={getExercise1RMHistory(historyExercise.id)}
          detailHistory={getExerciseHistory(historyExercise.id)}
        />
      )}

      {screen === "weight" && (
        <WeightScreen
          onBack={() => setScreen("home")}
          weights={data.weights}
          onSave={addWeight}
          settings={data.settings}
        />
      )}

      {screen === "meal" && (
        <MealScreen
          onBack={() => setScreen("home")}
          meals={getTodayMeals()}
          settings={data.settings}
          onSave={addMeal}
          onDelete={deleteMeal}
        />
      )}

      {screen === "chat" && (
        <ChatScreen
          onBack={() => setScreen("home")}
          messages={data.chatHistory}
          onSend={sendChat}
          userGender={data.settings.userGender}
        />
      )}

      {screen === "settings" && (
        <SettingsScreen
          onBack={() => setScreen("home")}
          settings={data.settings}
          onSave={updateSettings}
          onClearChatHistory={clearChatHistory}
          onResetAllData={resetAllData}
          musicEnabled={musicSettings.enabled}
          musicVolume={musicSettings.volume}
          onMusicEnabledChange={(enabled) => void updateMusicSettings({ enabled })}
          onMusicVolumeChange={(volume) => void updateMusicSettings({ volume })}
        />
      )}
    </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
});

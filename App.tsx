import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useState } from "react";
import { useAppData } from "./hooks/useAppData";
import { HomeScreen } from "./screens/HomeScreen";
import { TrainingScreen } from "./screens/TrainingScreen";
import { TrainingHistoryScreen } from "./screens/TrainingHistoryScreen";
import { ExerciseHistoryScreen } from "./screens/ExerciseHistoryScreen";
import { WeightScreen } from "./screens/WeightScreen";
import { MealScreen } from "./screens/MealScreen";
import { ChatScreen } from "./screens/ChatScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { ScreenName } from "./types";
import { colors } from "./constants/theme";

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

  const openExerciseHistory = (id: string, name: string, back: ScreenName = "training") => {
    setHistoryExercise({ id, name });
    setExerciseHistoryBack(back);
    setScreen("exerciseHistory");
  };

  if (loading || !data) {
    return (
      <View style={styles.loading}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
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
    <View style={styles.root}>
      <StatusBar style="light" />

      {screen === "home" && (
        <HomeScreen
          onNavigate={setScreen}
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
        />
      )}

      {screen === "settings" && (
        <SettingsScreen
          onBack={() => setScreen("home")}
          settings={data.settings}
          onSave={updateSettings}
          onClearChatHistory={clearChatHistory}
          onResetAllData={resetAllData}
        />
      )}
    </View>
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

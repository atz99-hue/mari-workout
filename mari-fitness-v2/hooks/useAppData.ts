import { useCallback, useEffect, useRef, useState } from "react";
import {
  AppData,
  AppSettings,
  ExerciseLog,
  MealEntry,
  SetRecord,
  TrainingLog,
  WeightEntry,
} from "../types";
import { loadAppData, resetAppDataToDefault, saveAppData, todayKey } from "../storage";
import {
  askMari,
  createChatMessage,
  createMealEntry,
  createWeightEntry,
} from "../services/aiService";
import {
  buildExerciseLog,
  findPreviousExerciseLog,
  get1RMHistory,
  getExerciseLogsForHistory,
  getSessionExerciseDetails,
  getTrainingSessionSummaries,
  reconcileTrainingLogPRs,
  validateExerciseSets,
} from "../utils/training";
import {
  getDayOfWeekWorkout,
  isTodayWorkoutOverridden,
  resolveTodayWorkout,
} from "../constants/workouts";

export function useAppData() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  /** reset 後に進行中の persist が旧データを書き戻すのを防ぐ */
  const persistGenerationRef = useRef(0);

  useEffect(() => {
    loadAppData().then((loaded) => {
      setData(loaded);
      setLoading(false);
    });
  }, []);

  const persist = useCallback(async (next: AppData) => {
    const genAtStart = persistGenerationRef.current;
    const reconciled: AppData = {
      ...next,
      trainingLogs: reconcileTrainingLogPRs(next.trainingLogs),
    };
    if (genAtStart !== persistGenerationRef.current) return;

    setData(reconciled);
    await saveAppData(reconciled);
    if (genAtStart !== persistGenerationRef.current) return;
  }, []);

  const addWeight = useCallback(
    async (weight: number, memo?: string) => {
      if (!data) return;
      const entry = createWeightEntry(weight, memo);
      const today = todayKey();
      const filtered = data.weights.filter((w) => w.date !== today);
      await persist({ ...data, weights: [entry, ...filtered] });
    },
    [data, persist]
  );

  const addMeal = useCallback(
    async (name: string, calories?: number, protein?: number, memo?: string) => {
      if (!data) return;
      const entry = createMealEntry(name, calories, protein, memo);
      await persist({ ...data, meals: [entry, ...data.meals] });
    },
    [data, persist]
  );

  const deleteMeal = useCallback(
    async (id: string) => {
      if (!data) return;
      await persist({ ...data, meals: data.meals.filter((m) => m.id !== id) });
    },
    [data, persist]
  );

  const toggleExercise = useCallback(
    async (workoutId: string, exerciseId: string) => {
      if (!data) return;
      const today = todayKey();
      const logs = [...data.trainingLogs];
      const idx = logs.findIndex((l) => l.date === today && l.workoutId === workoutId);
      const existing: TrainingLog =
        idx >= 0
          ? { ...logs[idx], exerciseLogs: logs[idx].exerciseLogs ?? [] }
          : { date: today, workoutId, completedExercises: [], exerciseLogs: [] };

      const completed = existing.completedExercises.includes(exerciseId)
        ? existing.completedExercises.filter((id) => id !== exerciseId)
        : [...existing.completedExercises, exerciseId];

      const updated: TrainingLog = {
        ...existing,
        completedExercises: completed,
        updatedAt: new Date().toISOString(),
      };
      if (idx >= 0) logs[idx] = updated;
      else logs.push(updated);

      await persist({ ...data, trainingLogs: logs });
    },
    [data, persist]
  );

  const saveExerciseLog = useCallback(
    async (
      workoutId: string,
      exerciseId: string,
      exerciseName: string,
      sets: SetRecord[]
    ): Promise<ExerciseLog | undefined> => {
      if (!data) return undefined;
      if (!validateExerciseSets(sets).ok) return undefined;
      const today = todayKey();
      const logs = [...data.trainingLogs];
      const idx = logs.findIndex((l) => l.date === today && l.workoutId === workoutId);

      const exerciseLog = buildExerciseLog(
        exerciseId,
        exerciseName,
        sets,
        logs,
        today,
        workoutId
      );
      const existing: TrainingLog =
        idx >= 0
          ? { ...logs[idx], exerciseLogs: [...(logs[idx].exerciseLogs ?? [])] }
          : { date: today, workoutId, completedExercises: [], exerciseLogs: [] };

      const logIdx = existing.exerciseLogs!.findIndex((e) => e.exerciseId === exerciseId);
      if (logIdx >= 0) existing.exerciseLogs![logIdx] = exerciseLog;
      else existing.exerciseLogs!.push(exerciseLog);

      if (!existing.completedExercises.includes(exerciseId)) {
        existing.completedExercises = [...existing.completedExercises, exerciseId];
      }
      existing.updatedAt = new Date().toISOString();

      const nextLogs = [...logs];
      if (idx >= 0) nextLogs[idx] = existing;
      else nextLogs.push(existing);

      const next: AppData = { ...data, trainingLogs: nextLogs };
      await persist(next);

      return reconcileTrainingLogPRs(next.trainingLogs)
        .find((l) => l.date === today && l.workoutId === workoutId)
        ?.exerciseLogs?.find((e) => e.exerciseId === exerciseId);
    },
    [data, persist]
  );

  const sendChat = useCallback(
    async (message: string) => {
      if (!data) return;
      const userMsg = createChatMessage("user", message);
      const withUser: AppData = { ...data, chatHistory: [...data.chatHistory, userMsg] };
      await persist(withUser);

      const reply = await askMari(message, withUser);
      const assistantMsg = createChatMessage("assistant", reply);
      await persist({
        ...withUser,
        chatHistory: [...withUser.chatHistory, assistantMsg],
      });
    },
    [data, persist]
  );

  const updateSettings = useCallback(
    async (settings: Partial<AppSettings>) => {
      if (!data) return;
      await persist({
        ...data,
        settings: { ...data.settings, ...settings },
      });
    },
    [data, persist]
  );

  const clearChatHistory = useCallback(async () => {
    if (!data) return;
    await persist({ ...data, chatHistory: [] });
  }, [data, persist]);

  const resetAllData = useCallback(async () => {
    persistGenerationRef.current += 1;
    const fresh = await resetAppDataToDefault();
    setData(fresh);
  }, []);

  const getResolvedTodayWorkout = useCallback(() => {
    if (!data) return getDayOfWeekWorkout();
    return resolveTodayWorkout(data.todayWorkoutOverride);
  }, [data]);

  const getDefaultWorkoutForToday = useCallback(() => getDayOfWeekWorkout(), []);

  const getIsTodayWorkoutOverridden = useCallback(() => {
    if (!data) return false;
    return isTodayWorkoutOverridden(data.todayWorkoutOverride);
  }, [data]);

  const setTodayWorkoutOverride = useCallback(
    async (workoutId: string) => {
      if (!data) return;
      const today = todayKey();
      await persist({
        ...data,
        todayWorkoutOverride: { date: today, workoutId },
      });
    },
    [data, persist]
  );

  const clearTodayWorkoutOverride = useCallback(async () => {
    if (!data) return;
    const { todayWorkoutOverride: _, ...rest } = data;
    await persist(rest as AppData);
  }, [data, persist]);

  const getTodayTrainingLog = useCallback(
    (workoutId: string): TrainingLog | undefined => {
      if (!data) return undefined;
      return data.trainingLogs.find((l) => l.date === todayKey() && l.workoutId === workoutId);
    },
    [data]
  );

  const getLatestWeight = useCallback((): WeightEntry | undefined => {
    if (!data || data.weights.length === 0) return undefined;
    const sorted = [...data.weights].sort((a, b) => b.date.localeCompare(a.date));
    return sorted[0];
  }, [data]);

  const getTodayMeals = useCallback((): MealEntry[] => {
    if (!data) return [];
    return data.meals.filter((m) => m.date === todayKey());
  }, [data]);

  const getTodayExerciseLog = useCallback(
    (workoutId: string, exerciseId: string): ExerciseLog | undefined => {
      if (!data) return undefined;
      const log = data.trainingLogs.find((l) => l.date === todayKey() && l.workoutId === workoutId);
      return log?.exerciseLogs?.find((e) => e.exerciseId === exerciseId);
    },
    [data]
  );

  const getPreviousExerciseLog = useCallback(
    (exerciseId: string): ExerciseLog | undefined => {
      if (!data) return undefined;
      return findPreviousExerciseLog(data.trainingLogs, exerciseId, todayKey());
    },
    [data]
  );

  const getTrainingHistory = useCallback(() => {
    if (!data) return [];
    return getTrainingSessionSummaries(data.trainingLogs);
  }, [data]);

  const getExercise1RMHistory = useCallback(
    (exerciseId: string) => {
      if (!data) return [];
      return get1RMHistory(data.trainingLogs, exerciseId);
    },
    [data]
  );

  const getExerciseHistory = useCallback(
    (exerciseId: string) => {
      if (!data) return [];
      return getExerciseLogsForHistory(data.trainingLogs, exerciseId);
    },
    [data]
  );

  const getSessionDetailsForDate = useCallback(
    (date: string, workoutId: string) => {
      if (!data) return [];
      const log = data.trainingLogs.find((l) => l.date === date && l.workoutId === workoutId);
      return getSessionExerciseDetails(log, workoutId, data.trainingLogs);
    },
    [data]
  );

  return {
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
  };
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppData, DEFAULT_SETTINGS } from "../types";
import { reconcileTrainingLogPRs } from "../utils/training";

const STORAGE_KEY = "@mari_fitness_data";
const STORAGE_VERSION = 4;

type StoredPayload = AppData & { _version?: number };

export function createDefaultAppData(): AppData {
  return {
    settings: { ...DEFAULT_SETTINGS },
    weights: [],
    meals: [],
    trainingLogs: [],
    chatHistory: [],
  };
}

const DEFAULT_DATA: AppData = createDefaultAppData();

function migrate(raw: StoredPayload): AppData {
  const today = todayKey();
  const override =
    raw.todayWorkoutOverride?.date === today ? raw.todayWorkoutOverride : undefined;

  const base: AppData = {
    settings: {
      ...DEFAULT_SETTINGS,
      ...raw.settings,
      userGender: raw.settings?.userGender ?? DEFAULT_SETTINGS.userGender,
    },
    weights: raw.weights ?? [],
    meals: raw.meals ?? [],
    trainingLogs: reconcileTrainingLogPRs(
      (raw.trainingLogs ?? []).map((log) => ({
        ...log,
        exerciseLogs: log.exerciseLogs ?? [],
      }))
    ),
    chatHistory: raw.chatHistory ?? [],
    todayWorkoutOverride: override,
  };
  return base;
}

export async function loadAppData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed: StoredPayload = JSON.parse(raw);
    return migrate(parsed);
  } catch {
    return DEFAULT_DATA;
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  const payload: StoredPayload = { ...data, _version: STORAGE_VERSION };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export async function clearAppData(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

/** AsyncStorage を削除し、空の初期データで上書き保存する */
export async function resetAppDataToDefault(): Promise<AppData> {
  const fresh = createDefaultAppData();
  await AsyncStorage.removeItem(STORAGE_KEY);
  const payload: StoredPayload = { ...fresh, _version: STORAGE_VERSION };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return fresh;
}

export function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type SetRecord = {
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
};

/** 種目ごとの詳細ログ（MARI分析用メタデータ付き） */
export type ExerciseLog = {
  exerciseId: string;
  exerciseName: string;
  sets: SetRecord[];
  /** Epley式による推定1RM (kg) */
  estimated1RM?: number;
  /** 保存時点での前回推定1RM */
  previousEstimated1RM?: number;
  /** 保存時点での当種目過去最高1RM（同日上書き前の baseline） */
  priorBest1RM?: number;
  /** 当種目の自己ベスト更新 */
  isPR?: boolean;
  savedAt?: string;
};

export type TrainingLog = {
  date: string;
  workoutId: string;
  /** 従来の完了チェック（互換維持） */
  completedExercises: string[];
  /** セット詳細ログ（任意・後方互換） */
  exerciseLogs?: ExerciseLog[];
  updatedAt?: string;
};

export type ScreenName =
  | "home"
  | "training"
  | "trainingHistory"
  | "exerciseHistory"
  | "weight"
  | "meal"
  | "chat"
  | "settings";

export type WeightEntry = {
  id: string;
  date: string;
  weight: number;
  memo?: string;
};

export type MealEntry = {
  id: string;
  date: string;
  name: string;
  calories?: number;
  protein?: number;
  memo?: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export type UserGender = "male" | "female";

export type AppSettings = {
  userName: string;
  userGender: UserGender;
  targetWeight?: number;
  dailyCalorieGoal: number;
  dailyProteinGoal: number;
};

export type AppData = {
  settings: AppSettings;
  weights: WeightEntry[];
  meals: MealEntry[];
  trainingLogs: TrainingLog[];
  chatHistory: ChatMessage[];
  /** 今日だけのメニュー変更（date が今日でない場合は無視） */
  todayWorkoutOverride?: TodayWorkoutOverride;
};

export type TodayWorkoutOverride = {
  date: string;
  workoutId: string;
};

export type WorkoutExercise = {
  id: string;
  name: string;
  sets?: string;
};

export type Workout = {
  id: string;
  title: string;
  emoji: string;
  exercises: WorkoutExercise[];
};

export const DEFAULT_SETTINGS: AppSettings = {
  userName: "ゲスト",
  userGender: "male",
  dailyCalorieGoal: 2000,
  dailyProteinGoal: 120,
};

/** 1RM履歴エントリ（表示・AI分析用） */
export type OneRMHistoryEntry = {
  date: string;
  estimated1RM: number;
  bestSet: { weightKg: number; reps: number };
  isPR: boolean;
};

/** 前回比較結果 */
export type ExerciseComparison = {
  hasPrevious: boolean;
  improved: boolean;
  isPR: boolean;
  current1RM?: number;
  previous1RM?: number;
  delta1RM?: number;
  message: string;
};

/** セッション履歴1種目分の表示用データ */
export type SessionExerciseDetail = {
  exerciseId: string;
  exerciseName: string;
  completed: boolean;
  hasLog: boolean;
  setCount: number;
  setsSummary: string;
  estimated1RM?: number;
  isPR?: boolean;
};

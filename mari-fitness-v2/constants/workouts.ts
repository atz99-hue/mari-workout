import { Workout } from "../types";
import { todayKey } from "../storage";

const WEEKLY_WORKOUTS: Workout[] = [
  {
    id: "chest-triceps",
    title: "胸・三頭筋",
    emoji: "🏋️",
    exercises: [
      { id: "bench-press", name: "ベンチプレス", sets: "4×8" },
      { id: "incline-bench", name: "インクラインベンチ", sets: "3×10" },
      { id: "dips", name: "ディップス", sets: "3×12" },
      { id: "cable-pressdown", name: "ケーブルプレスダウン", sets: "3×15" },
      { id: "overhead-extension", name: "オーバーヘッドエクステンション", sets: "3×12" },
    ],
  },
  {
    id: "back-biceps",
    title: "背中・二頭筋",
    emoji: "💪",
    exercises: [
      { id: "deadlift", name: "デッドリフト", sets: "4×6" },
      { id: "lat-pulldown", name: "ラットプルダウン", sets: "4×10" },
      { id: "barbell-row", name: "バーベルロー", sets: "3×10" },
      { id: "face-pull", name: "フェイスプル", sets: "3×15" },
      { id: "barbell-curl", name: "バーベルカール", sets: "3×12" },
    ],
  },
  {
    id: "legs",
    title: "脚",
    emoji: "🦵",
    exercises: [
      { id: "squat", name: "スクワット", sets: "4×8" },
      { id: "leg-press", name: "レッグプレス", sets: "3×12" },
      { id: "romanian-deadlift", name: "ルーマニアンデッドリフト", sets: "3×10" },
      { id: "leg-curl", name: "レッグカール", sets: "3×12" },
      { id: "calf-raise", name: "カーフレイズ", sets: "4×15" },
    ],
  },
  {
    id: "shoulders-abs",
    title: "肩・腹筋",
    emoji: "🔥",
    exercises: [
      { id: "overhead-press", name: "オーバーヘッドプレス", sets: "4×8" },
      { id: "lateral-raise", name: "サイドレイズ", sets: "3×15" },
      { id: "rear-delt-fly", name: "リアデルトフライ", sets: "3×15" },
      { id: "plank", name: "プランク", sets: "3×60秒" },
      { id: "crunch", name: "クランチ", sets: "3×20" },
    ],
  },
  {
    id: "full-body",
    title: "全身",
    emoji: "⚡",
    exercises: [
      { id: "goblet-squat", name: "ゴブレットスクワット", sets: "3×12" },
      { id: "push-up", name: "プッシュアップ", sets: "3×15" },
      { id: "dumbbell-row", name: "ダンベルロー", sets: "3×12" },
      { id: "lunges", name: "ランジ", sets: "3×10" },
      { id: "mountain-climber", name: "マウンテンクライマー", sets: "3×30秒" },
    ],
  },
  {
    id: "active-recovery",
    title: "アクティブリカバリー",
    emoji: "🧘",
    exercises: [
      { id: "stretching", name: "全身ストレッチ", sets: "15分" },
      { id: "foam-roll", name: "フォームローラー", sets: "10分" },
      { id: "light-walk", name: "軽いウォーキング", sets: "20分" },
      { id: "yoga", name: "ヨガ", sets: "15分" },
    ],
  },
  {
    id: "rest",
    title: "休息日",
    emoji: "😴",
    exercises: [
      { id: "rest-hydrate", name: "水分補給を意識", sets: "—" },
      { id: "rest-sleep", name: "十分な睡眠", sets: "7〜8時間" },
      { id: "rest-protein", name: "タンパク質を意識した食事", sets: "—" },
    ],
  },
];

/** 曜日（0=日）に対応するデフォルトメニュー */
export function getDayOfWeekWorkout(dayOfWeek: number = new Date().getDay()): Workout {
  return WEEKLY_WORKOUTS[dayOfWeek] ?? WEEKLY_WORKOUTS[0];
}

export type WorkoutOverride = { date: string; workoutId: string } | null | undefined;

/** 今日のメニューを解決（オーバーライドが今日なら優先、翌日は自動的に曜日デフォルト） */
export function resolveTodayWorkout(override?: WorkoutOverride): Workout {
  const today = todayKey();
  if (override?.date === today) {
    const custom = getWorkoutById(override.workoutId);
    if (custom) return custom;
  }
  return getDayOfWeekWorkout();
}

/** @deprecated resolveTodayWorkout を使用してください */
export function getTodayWorkout(): Workout {
  return getDayOfWeekWorkout();
}

export function getWorkoutById(id: string): Workout | undefined {
  return WEEKLY_WORKOUTS.find((w) => w.id === id);
}

/** 種目IDから日本語名を解決（workoutId 優先、なければ全メニューから検索） */
export function getExerciseNameById(exerciseId: string, workoutId?: string): string {
  if (workoutId) {
    const fromWorkout = getWorkoutById(workoutId)?.exercises.find((e) => e.id === exerciseId);
    if (fromWorkout) return fromWorkout.name;
  }
  for (const workout of WEEKLY_WORKOUTS) {
    const found = workout.exercises.find((e) => e.id === exerciseId);
    if (found) return found.name;
  }
  return exerciseId;
}

export function isTodayWorkoutOverridden(override?: WorkoutOverride): boolean {
  const today = todayKey();
  if (!override || override.date !== today) return false;
  return override.workoutId !== getDayOfWeekWorkout().id;
}

export { WEEKLY_WORKOUTS };

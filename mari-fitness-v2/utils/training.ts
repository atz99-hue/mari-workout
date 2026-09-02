import {
  ExerciseComparison,
  ExerciseLog,
  OneRMHistoryEntry,
  SessionExerciseDetail,
  SetRecord,
  TrainingLog,
} from "../types";
import { getExerciseNameById, getWorkoutById } from "../constants/workouts";

export const MIN_REPS = 1;
export const MAX_REPS = 30;
export const MAX_WEIGHT_KG = 500;

/** Epley式: 推定1RM = 重量 × (1 + 回数/30)。正常範囲のセットのみ計算する */
export function estimate1RM(weightKg: number, reps: number): number {
  if (!isValidSetFor1RM({ weightKg, reps, completed: true })) return 0;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

export function parseRepsInput(value: string): number {
  const digits = value.replace(/[^0-9]/g, "");
  if (!digits) return 0;
  const n = parseInt(digits, 10);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(MAX_REPS, n);
}

export function sanitizeWeightInput(value: string): string {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const dotIndex = cleaned.indexOf(".");
  const normalized =
    dotIndex === -1
      ? cleaned
      : `${cleaned.slice(0, dotIndex)}.${cleaned.slice(dotIndex + 1).replace(/\./g, "")}`;
  const raw = parseFloat(normalized);
  if (Number.isFinite(raw) && raw > MAX_WEIGHT_KG) return String(MAX_WEIGHT_KG);
  return normalized;
}

export function parseWeightInput(input: string): number {
  const trimmed = input.trim();
  if (!trimmed || trimmed === ".") return 0;
  const num = parseFloat(trimmed);
  if (!Number.isFinite(num) || num <= 0) return 0;
  return Math.min(MAX_WEIGHT_KG, num);
}

/** 推定1RMに使う完了セット（回数 1〜30、重量 0超〜500） */
export function isValidSetFor1RM(
  set: Pick<SetRecord, "weightKg" | "reps" | "completed">
): boolean {
  return (
    set.completed &&
    set.weightKg > 0 &&
    set.weightKg <= MAX_WEIGHT_KG &&
    set.reps >= MIN_REPS &&
    set.reps <= MAX_REPS
  );
}

function hasOutlierReps(sets: SetRecord[]): boolean {
  const reps = sets
    .filter((s) => s.reps >= MIN_REPS)
    .map((s) => s.reps)
    .sort((a, b) => a - b);
  if (reps.length < 2) return false;
  const max = reps[reps.length - 1];
  const next = reps[reps.length - 2];
  return max > next * 2 && max - next >= 10;
}

export function validateExerciseSets(
  sets: SetRecord[]
): { ok: true } | { ok: false; message: string } {
  if (!sets.some((s) => s.reps > 0)) {
    return { ok: false, message: "1セット以上、回数を入力してください" };
  }

  for (const s of sets) {
    if (s.reps === 0 && s.weightKg === 0) continue;
    if (s.reps < 0 || s.reps > MAX_REPS) {
      return { ok: false, message: `回数は${MIN_REPS}〜${MAX_REPS}回で入力してください` };
    }
    if (s.reps > 0 && s.reps < MIN_REPS) {
      return { ok: false, message: `回数は${MIN_REPS}〜${MAX_REPS}回で入力してください` };
    }
    if (s.weightKg < 0 || s.weightKg > MAX_WEIGHT_KG) {
      return { ok: false, message: `重量は${MAX_WEIGHT_KG}kg以下で入力してください` };
    }
  }

  if (hasOutlierReps(sets)) {
    return {
      ok: false,
      message: "セット間の回数差が大きすぎます。入力を確認してください",
    };
  }

  return { ok: true };
}

export function parseTargetSetCount(setsLabel?: string): number {
  if (!setsLabel) return 3;
  const match = setsLabel.match(/^(\d+)/);
  if (!match) return 3;
  const n = parseInt(match[1], 10);
  return n > 0 && n <= 20 ? n : 3;
}

export function createEmptySets(count: number): SetRecord[] {
  return Array.from({ length: count }, (_, i) => ({
    setNumber: i + 1,
    weightKg: 0,
    reps: 0,
    completed: false,
  }));
}

export function getBest1RMFromSets(sets: SetRecord[]): number {
  let best = 0;
  for (const s of sets) {
    if (isValidSetFor1RM(s)) {
      best = Math.max(best, estimate1RM(s.weightKg, s.reps));
    }
  }
  return best;
}

export function getBestSet(sets: SetRecord[]): { weightKg: number; reps: number } | undefined {
  let best: { weightKg: number; reps: number; rm: number } | undefined;
  for (const s of sets) {
    if (!isValidSetFor1RM(s)) continue;
    const rm = estimate1RM(s.weightKg, s.reps);
    if (!best || rm > best.rm) {
      best = { weightKg: s.weightKg, reps: s.reps, rm };
    }
  }
  return best ? { weightKg: best.weightKg, reps: best.reps } : undefined;
}

export function findPreviousExerciseLog(
  logs: TrainingLog[],
  exerciseId: string,
  beforeDate: string
): ExerciseLog | undefined {
  const sorted = [...logs]
    .filter((l) => l.date < beforeDate)
    .sort((a, b) => b.date.localeCompare(a.date));

  for (const log of sorted) {
    const found = log.exerciseLogs?.find((e) => e.exerciseId === exerciseId);
    if (found && found.estimated1RM && found.estimated1RM > 0) {
      return found;
    }
  }
  return undefined;
}

export function getBestHistorical1RM(
  logs: TrainingLog[],
  exerciseId: string,
  excludeDate?: string
): number {
  let best = 0;
  for (const log of logs) {
    if (excludeDate && log.date === excludeDate) continue;
    const entry = log.exerciseLogs?.find((e) => e.exerciseId === exerciseId);
    if (entry?.estimated1RM && entry.estimated1RM > best) {
      best = entry.estimated1RM;
    }
  }
  return best;
}

function exerciseLogKey(log: TrainingLog, ex: ExerciseLog): string {
  return `${log.date}|${log.workoutId}|${ex.exerciseId}|${ex.savedAt ?? ""}`;
}

/** 同一種目の過去最高推定1RM（保存前の logs から集計） */
export function getPriorBest1RM(logs: TrainingLog[], exerciseId: string): number {
  let best = 0;
  for (const log of logs) {
    for (const ex of log.exerciseLogs ?? []) {
      if (ex.exerciseId === exerciseId && ex.estimated1RM) {
        best = Math.max(best, ex.estimated1RM);
      }
    }
  }
  return best;
}

/**
 * 種目ごとに isPR を再計算する。
 * - priorBest1RM あり（新形式）: 保存時 snapshot と比較 → 同日上書きでも正しく判定
 * - priorBest1RM なし（旧データ）: 時系列 runningBest で判定
 */
export function reconcileTrainingLogPRs(logs: TrainingLog[]): TrainingLog[] {
  const prByKey = new Map<string, boolean>();
  const byExercise = new Map<string, { log: TrainingLog; ex: ExerciseLog }[]>();

  for (const log of logs) {
    for (const ex of log.exerciseLogs ?? []) {
      const list = byExercise.get(ex.exerciseId) ?? [];
      list.push({ log, ex });
      byExercise.set(ex.exerciseId, list);
    }
  }

  for (const entries of byExercise.values()) {
    entries.sort((a, b) => {
      if (a.log.date !== b.log.date) return a.log.date.localeCompare(b.log.date);
      const sa = a.ex.savedAt ?? "";
      const sb = b.ex.savedAt ?? "";
      if (sa !== sb) return sa.localeCompare(sb);
      return a.log.workoutId.localeCompare(b.log.workoutId);
    });

    let runningBest = 0;
    for (const { log, ex } of entries) {
      const rm = ex.estimated1RM ?? 0;
      let isPR = false;
      if (rm > 0) {
        if (ex.priorBest1RM !== undefined && ex.priorBest1RM > 0) {
          isPR = rm > ex.priorBest1RM;
        } else {
          isPR = runningBest > 0 && rm > runningBest;
        }
        runningBest = Math.max(runningBest, rm);
      }
      prByKey.set(exerciseLogKey(log, ex), isPR);
    }
  }

  return logs.map((log) => ({
    ...log,
    exerciseLogs: (log.exerciseLogs ?? []).map((ex) => ({
      ...ex,
      isPR: prByKey.get(exerciseLogKey(log, ex)) ?? false,
    })),
  }));
}

export function resolveIsPR(
  exerciseId: string,
  estimated1RM: number | undefined,
  logs: TrainingLog[]
): boolean {
  if (!estimated1RM || estimated1RM <= 0) return false;
  const priorBest = getPriorBest1RM(logs, exerciseId);
  return priorBest > 0 && estimated1RM > priorBest;
}

export function countSessionPRs(log: TrainingLog): number {
  const prIds = new Set(
    (log.exerciseLogs ?? []).filter((e) => e.isPR).map((e) => e.exerciseId)
  );
  return prIds.size;
}

export function buildExerciseLog(
  exerciseId: string,
  exerciseName: string,
  sets: SetRecord[],
  logs: TrainingLog[],
  date: string,
  workoutId: string
): ExerciseLog {
  const estimated1RM = getBest1RMFromSets(sets);
  const previous = findPreviousExerciseLog(logs, exerciseId, date);
  const previousEstimated1RM = previous?.estimated1RM;
  const rm = estimated1RM > 0 ? estimated1RM : undefined;
  const priorBest1RM = getPriorBest1RM(logs, exerciseId);
  /** 初回記録は PR にしない。過去最高がある場合のみ、それを超えたら PR */
  const isPR = priorBest1RM > 0 && rm !== undefined && rm > priorBest1RM;

  return {
    exerciseId,
    exerciseName,
    sets,
    estimated1RM: rm,
    previousEstimated1RM,
    priorBest1RM: priorBest1RM > 0 ? priorBest1RM : undefined,
    isPR,
    savedAt: new Date().toISOString(),
  };
}

export function compareExercise(
  current: ExerciseLog | undefined,
  previous: ExerciseLog | undefined
): ExerciseComparison {
  const current1RM = current?.estimated1RM ?? 0;
  const previous1RM = previous?.estimated1RM ?? 0;

  if (!current?.estimated1RM || current.estimated1RM <= 0) {
    return {
      hasPrevious: !!previous?.estimated1RM,
      improved: false,
      isPR: false,
      message: "セットを記録すると比較できます",
    };
  }

  if (current.isPR) {
    return {
      hasPrevious: true,
      improved: true,
      isPR: true,
      current1RM,
      previous1RM: previous1RM || undefined,
      delta1RM: previous1RM > 0 ? Math.round((current1RM - previous1RM) * 10) / 10 : undefined,
      message: "🔥 自己ベスト更新！",
    };
  }

  if (!previous?.estimated1RM) {
    return {
      hasPrevious: false,
      improved: false,
      isPR: false,
      current1RM,
      message: "初記録 — 次回から比較できます",
    };
  }

  const delta = Math.round((current1RM - previous1RM) * 10) / 10;
  if (delta > 0) {
    return {
      hasPrevious: true,
      improved: true,
      isPR: false,
      current1RM,
      previous1RM,
      delta1RM: delta,
      message: `↑ 前回より +${delta}kg（推定1RM）`,
    };
  }
  if (delta < 0) {
    return {
      hasPrevious: true,
      improved: false,
      isPR: false,
      current1RM,
      previous1RM,
      delta1RM: delta,
      message: `↓ 前回より ${delta}kg — 回復を優先しましょう`,
    };
  }
  return {
    hasPrevious: true,
    improved: false,
    isPR: false,
    current1RM,
    previous1RM,
    delta1RM: 0,
    message: "→ 前回と同程度",
  };
}

export function isFinitePositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function get1RMHistory(logs: TrainingLog[], exerciseId: string): OneRMHistoryEntry[] {
  const reconciled = reconcileTrainingLogPRs(logs);
  const entries: OneRMHistoryEntry[] = [];
  for (const log of reconciled) {
    const ex = log.exerciseLogs?.find((e) => e.exerciseId === exerciseId);
    if (!isFinitePositiveNumber(ex?.estimated1RM)) continue;
    const bestSet = getBestSet(ex.sets) ?? { weightKg: 0, reps: 0 };
    entries.push({
      date: log.date,
      estimated1RM: ex.estimated1RM,
      bestSet,
      isPR: !!ex.isPR,
    });
  }
  return entries.sort((a, b) => a.date.localeCompare(b.date));
}

export type ExerciseGrowthSummary = {
  best1RM?: number;
  bestWeightKg?: number;
  bestReps?: number;
  comparison: ExerciseComparison;
  prHistory: OneRMHistoryEntry[];
  chartHistory: OneRMHistoryEntry[];
};

/** 成長画面用の集計。保存・PR判定ロジックは変更しない */
export function getExerciseGrowthSummary(
  oneRMHistory: OneRMHistoryEntry[],
  detailHistory: { log: ExerciseLog }[]
): ExerciseGrowthSummary {
  const chartHistory = oneRMHistory.filter((e) => isFinitePositiveNumber(e.estimated1RM));
  const best1RMRaw = chartHistory.reduce((max, e) => Math.max(max, e.estimated1RM), 0);
  const best1RM = best1RMRaw > 0 ? best1RMRaw : undefined;

  let bestWeightKg = 0;
  let bestReps = 0;
  for (const { log } of detailHistory) {
    for (const s of log.sets ?? []) {
      if (!s.completed) continue;
      if (!Number.isFinite(s.reps) || !Number.isFinite(s.weightKg)) continue;
      if (s.reps < MIN_REPS || s.reps > MAX_REPS) continue;
      if (s.weightKg < 0 || s.weightKg > MAX_WEIGHT_KG) continue;
      bestReps = Math.max(bestReps, s.reps);
      if (s.weightKg > 0) bestWeightKg = Math.max(bestWeightKg, s.weightKg);
    }
  }

  const latest = chartHistory[chartHistory.length - 1];
  const previous = chartHistory.length >= 2 ? chartHistory[chartHistory.length - 2] : undefined;
  const comparison = compareExercise(
    latest
      ? {
          exerciseId: "",
          exerciseName: "",
          sets: [],
          estimated1RM: latest.estimated1RM,
          isPR: latest.isPR,
        }
      : undefined,
    previous
      ? {
          exerciseId: "",
          exerciseName: "",
          sets: [],
          estimated1RM: previous.estimated1RM,
        }
      : undefined
  );

  return {
    best1RM,
    bestWeightKg: bestWeightKg > 0 ? bestWeightKg : undefined,
    bestReps: bestReps > 0 ? bestReps : undefined,
    comparison,
    prHistory: [...chartHistory].filter((e) => e.isPR).reverse(),
    chartHistory,
  };
}

export function getExerciseLogsForHistory(
  logs: TrainingLog[],
  exerciseId: string
): { date: string; log: ExerciseLog; workoutId: string }[] {
  return logs
    .flatMap((tl) => {
      const ex = tl.exerciseLogs?.find((e) => e.exerciseId === exerciseId);
      return ex ? [{ date: tl.date, log: ex, workoutId: tl.workoutId }] : [];
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getTrainingSessionSummaries(logs: TrainingLog[]) {
  const reconciled = reconcileTrainingLogPRs(logs);
  return [...reconciled]
    .filter((l) => (l.exerciseLogs?.length ?? 0) > 0 || l.completedExercises.length > 0)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((l) => ({
      date: l.date,
      workoutId: l.workoutId,
      completedCount: l.completedExercises.length,
      loggedCount: l.exerciseLogs?.length ?? 0,
      prCount: countSessionPRs(l),
    }));
}

export function formatSetsSummary(sets: SetRecord[]): { setCount: number; summary: string } {
  const done = sets.filter((s) => s.completed && s.reps > 0);
  const summary = done
    .map((s) => (s.weightKg > 0 ? `${s.weightKg}kg×${s.reps}` : `${s.reps}回`))
    .join(" / ");
  return { setCount: done.length, summary };
}

/** completedExercises + exerciseLogs をマージし、workouts.ts から種目名を解決 */
export function getSessionExerciseDetails(
  log: TrainingLog | undefined,
  workoutId: string,
  allLogs?: TrainingLog[]
): SessionExerciseDetail[] {
  if (!log) return [];

  const resolvedLog =
    allLogs && log.exerciseLogs?.length
      ? reconcileTrainingLogPRs(allLogs).find(
          (l) => l.date === log.date && l.workoutId === log.workoutId
        ) ?? log
      : log;

  const remaining = new Set<string>([
    ...resolvedLog.completedExercises,
    ...(resolvedLog.exerciseLogs ?? []).map((e) => e.exerciseId),
  ]);
  if (remaining.size === 0) return [];

  const orderedIds: string[] = [];
  const workout = getWorkoutById(workoutId);
  if (workout) {
    for (const ex of workout.exercises) {
      if (remaining.has(ex.id)) {
        orderedIds.push(ex.id);
        remaining.delete(ex.id);
      }
    }
  }
  orderedIds.push(...remaining);

  return orderedIds.map((id) => {
    const exerciseLog = resolvedLog.exerciseLogs?.find((e) => e.exerciseId === id);
    const { setCount, summary } = exerciseLog
      ? formatSetsSummary(exerciseLog.sets)
      : { setCount: 0, summary: "" };
    const completed = resolvedLog.completedExercises.includes(id);

    return {
      exerciseId: id,
      exerciseName: exerciseLog?.exerciseName ?? getExerciseNameById(id, workoutId),
      completed,
      hasLog: !!exerciseLog,
      setCount,
      setsSummary: summary || (completed ? "チェック完了" : "—"),
      estimated1RM: exerciseLog?.estimated1RM,
      isPR: exerciseLog?.isPR,
    };
  });
}

/**
 * 実機確認4ケース — saveExerciseLog と同一フローを再現
 * UI表示: ExerciseLogPanel の saved.isPR → フィードバック文言
 */

function estimate1RM(weightKg, reps) {
  if (weightKg <= 0 || reps <= 0) return 0;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

function getBest1RMFromSets(sets) {
  let best = 0;
  for (const s of sets) {
    if (s.completed && s.weightKg > 0 && s.reps > 0) {
      best = Math.max(best, estimate1RM(s.weightKg, s.reps));
    }
  }
  return best;
}

function getPriorBest1RM(logs, exerciseId) {
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

function exerciseLogKey(log, ex) {
  return `${log.date}|${log.workoutId}|${ex.exerciseId}|${ex.savedAt ?? ""}`;
}

function reconcileTrainingLogPRs(logs) {
  const prByKey = new Map();
  const byExercise = new Map();

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

function resolveIsPR(exerciseId, estimated1RM, logs) {
  if (!estimated1RM || estimated1RM <= 0) return false;
  const priorBest = getPriorBest1RM(logs, exerciseId);
  return priorBest > 0 && estimated1RM > priorBest;
}

function buildExerciseLog(exerciseId, exerciseName, sets, logs, date, workoutId) {
  const estimated1RM = getBest1RMFromSets(sets);
  const rm = estimated1RM > 0 ? estimated1RM : undefined;
  const priorBest1RM = getPriorBest1RM(logs, exerciseId);
  const isPR = priorBest1RM > 0 && rm !== undefined && rm > priorBest1RM;
  return {
    exerciseId,
    exerciseName,
    sets,
    estimated1RM: rm,
    priorBest1RM: priorBest1RM > 0 ? priorBest1RM : undefined,
    isPR,
    savedAt: new Date().toISOString(),
  };
}

function toSets(weightKg, reps) {
  return [{ setNumber: 1, weightKg, reps, completed: true }];
}

/** hooks/useAppData.ts saveExerciseLog と同一 */
function saveExerciseLog(logs, { date, workoutId, exerciseId, exerciseName, sets }) {
  const idx = logs.findIndex((l) => l.date === date && l.workoutId === workoutId);
  const exerciseLog = buildExerciseLog(exerciseId, exerciseName, sets, logs, date, workoutId);
  const existing =
    idx >= 0
      ? { ...logs[idx], exerciseLogs: [...(logs[idx].exerciseLogs ?? [])] }
      : { date, workoutId, completedExercises: [], exerciseLogs: [] };

  const logIdx = existing.exerciseLogs.findIndex((e) => e.exerciseId === exerciseId);
  if (logIdx >= 0) existing.exerciseLogs[logIdx] = exerciseLog;
  else existing.exerciseLogs.push(exerciseLog);

  if (!existing.completedExercises.includes(exerciseId)) {
    existing.completedExercises = [...existing.completedExercises, exerciseId];
  }

  const nextLogs = [...logs];
  if (idx >= 0) nextLogs[idx] = existing;
  else nextLogs.push(existing);

  const saved = reconcileTrainingLogPRs(nextLogs)
    .find((l) => l.date === date && l.workoutId === workoutId)
    ?.exerciseLogs?.find((e) => e.exerciseId === exerciseId);

  return { nextLogs, saved, buildIsPR: exerciseLog.isPR, reconcileIsPR: saved?.isPR };
}

function uiFeedback(saved) {
  return saved?.isPR ? "🔥 自己ベスト更新！" : "保存しました";
}

const EXERCISE = { id: "incline-bench", name: "インクラインベンチ" };
const WORKOUT = "chest-triceps";
const DAY1 = "2026-08-26";
const DAY2 = "2026-08-27";

let logs = [];
const results = [];

function runCase(num, title, action) {
  const detail = action();
  results.push({ num, title, ...detail });
}

// ケース1: 初回保存で自己ベスト更新 → PR
runCase(1, "初回保存で自己ベスト更新 → PRになる", () => {
  const r1 = saveExerciseLog(logs, {
    date: DAY1,
    workoutId: WORKOUT,
    exerciseId: EXERCISE.id,
    exerciseName: EXERCISE.name,
    sets: toSets(50, 10),
  });
  logs = r1.nextLogs;

  const r2 = saveExerciseLog(logs, {
    date: DAY1,
    workoutId: WORKOUT,
    exerciseId: EXERCISE.id,
    exerciseName: EXERCISE.name,
    sets: toSets(52.5, 10),
  });
  logs = r2.nextLogs;

  return {
    exercise: EXERCISE.name,
    weight: 52.5,
    reps: 10,
    operation: "1回目 50kg×10 保存 → 2回目 52.5kg×10 保存",
    estimated1RM: r2.saved.estimated1RM,
    isPR: r2.saved.isPR,
    feedback: uiFeedback(r2.saved),
    pass: r2.saved.isPR === true && uiFeedback(r2.saved) === "🔥 自己ベスト更新！",
  };
});

// ケース2: 同日再保存・記録更新なし → 非PR
runCase(2, "同日に再保存して記録が更新されない → PRにならない", () => {
  const r = saveExerciseLog(logs, {
    date: DAY1,
    workoutId: WORKOUT,
    exerciseId: EXERCISE.id,
    exerciseName: EXERCISE.name,
    sets: toSets(52.5, 10),
  });
  logs = r.nextLogs;

  return {
    exercise: EXERCISE.name,
    weight: 52.5,
    reps: 10,
    operation: "入力変更なしで「セットを保存」を再実行",
    estimated1RM: r.saved.estimated1RM,
    isPR: r.saved.isPR,
    feedback: uiFeedback(r.saved),
    pass: r.saved.isPR === false && uiFeedback(r.saved) === "保存しました",
  };
});

// ケース3: 同日再保存・記録更新あり → PR
runCase(3, "同日に再保存して記録が更新される → PRになる", () => {
  const r = saveExerciseLog(logs, {
    date: DAY1,
    workoutId: WORKOUT,
    exerciseId: EXERCISE.id,
    exerciseName: EXERCISE.name,
    sets: toSets(55, 10),
  });
  logs = r.nextLogs;

  return {
    exercise: EXERCISE.name,
    weight: 55,
    reps: 10,
    operation: "52.5kg×10 → 55kg×10 に変更して保存",
    estimated1RM: r.saved.estimated1RM,
    isPR: r.saved.isPR,
    feedback: uiFeedback(r.saved),
    pass: r.saved.isPR === true && uiFeedback(r.saved) === "🔥 自己ベスト更新！",
  };
});

// ケース4: 別日に過去ベスト更新 → PR
runCase(4, "別日に過去ベストを更新 → PRになる", () => {
  const r = saveExerciseLog(logs, {
    date: DAY2,
    workoutId: WORKOUT,
    exerciseId: EXERCISE.id,
    exerciseName: EXERCISE.name,
    sets: toSets(57.5, 10),
  });
  logs = r.nextLogs;

  return {
    exercise: EXERCISE.name,
    weight: 57.5,
    reps: 10,
    operation: `別日(${DAY2})に 57.5kg×10 を保存`,
    estimated1RM: r.saved.estimated1RM,
    isPR: r.saved.isPR,
    feedback: uiFeedback(r.saved),
    pass: r.saved.isPR === true && uiFeedback(r.saved) === "🔥 自己ベスト更新！",
  };
});

console.log("=== PR判定 実機確認シミュレーション（saveExerciseLog 同一フロー）===\n");

let failed = 0;
for (const r of results) {
  console.log(`【ケース${r.num}】${r.title}`);
  console.log(`  種目: ${r.exercise}`);
  console.log(`  重量: ${r.weight}kg / 回数: ${r.reps}`);
  console.log(`  操作: ${r.operation}`);
  console.log(`  推定1RM: ${r.estimated1RM}kg`);
  console.log(`  isPR: ${r.isPR}`);
  console.log(`  画面フィードバック: ${r.feedback}`);
  console.log(`  判定: ${r.pass ? "OK" : "FAIL"}\n`);
  if (!r.pass) failed++;
}

process.exit(failed === 0 ? 0 : 1);

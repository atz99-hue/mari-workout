/** PR再計算ロジックの検証 */

function estimate1RM(weightKg, reps) {
  if (weightKg <= 0 || reps <= 0) return 0;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
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
      return (a.ex.savedAt ?? "").localeCompare(b.ex.savedAt ?? "");
    });
    let runningBest = 0;
    for (const { log, ex } of entries) {
      const rm = ex.estimated1RM ?? 0;
      const key = `${log.date}|${log.workoutId}|${ex.exerciseId}|${ex.savedAt ?? ""}`;
      const isPR = rm > 0 && runningBest > 0 && rm > runningBest;
      prByKey.set(key, isPR);
      if (rm > 0) runningBest = Math.max(runningBest, rm);
    }
  }

  return logs.map((log) => ({
    ...log,
    exerciseLogs: (log.exerciseLogs ?? []).map((ex) => ({
      ...ex,
      isPR: prByKey.get(`${log.date}|${log.workoutId}|${ex.exerciseId}|${ex.savedAt ?? ""}`) ?? false,
    })),
  }));
}

function countSessionPRs(log) {
  return new Set((log.exerciseLogs ?? []).filter((e) => e.isPR).map((e) => e.exerciseId)).size;
}

const logs = [
  {
    date: "2025-08-18",
    workoutId: "chest-triceps",
    exerciseLogs: [
      {
        exerciseId: "incline-bench",
        exerciseName: "インクラインベンチ",
        estimated1RM: estimate1RM(50, 10),
        savedAt: "2025-08-18T10:00:00.000Z",
        sets: [],
      },
      {
        exerciseId: "bench-press",
        exerciseName: "ベンチプレス",
        estimated1RM: 100,
        savedAt: "2025-08-18T10:30:00.000Z",
        sets: [],
      },
    ],
  },
  {
    date: "2025-08-25",
    workoutId: "chest-triceps",
    exerciseLogs: [
      {
        exerciseId: "incline-bench",
        exerciseName: "インクラインベンチ",
        estimated1RM: estimate1RM(52.5, 10),
        savedAt: "2025-08-25T10:00:00.000Z",
        sets: [],
      },
      {
        exerciseId: "bench-press",
        exerciseName: "ベンチプレス",
        estimated1RM: 95,
        savedAt: "2025-08-25T10:30:00.000Z",
        sets: [],
      },
    ],
  },
];

const reconciled = reconcileTrainingLogPRs(logs);
const session825 = reconciled.find((l) => l.date === "2025-08-25");
const incline = session825.exerciseLogs.find((e) => e.exerciseId === "incline-bench");
const bench = session825.exerciseLogs.find((e) => e.exerciseId === "bench-press");

const tests = [
  ["incline 1RM = 70", incline.estimated1RM === 70],
  ["incline is PR", incline.isPR === true],
  ["bench is NOT PR (95 < 100 all-time)", bench.isPR === false],
  ["session PR count = 1", countSessionPRs(session825) === 1],
  ["first incline record NOT PR", !reconciled[0].exerciseLogs[0].isPR],
];

let failed = 0;
for (const [name, pass] of tests) {
  console.log(`${pass ? "OK" : "FAIL"}: ${name}`);
  if (!pass) failed++;
}
process.exit(failed === 0 ? 0 : 1);

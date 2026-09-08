/**
 * 本番 training.ts と同一ロジックで4ケース再検証
 * buildExerciseLog → merge → reconcile → ExerciseLogPanel フィードバック
 */

function estimate1RM(w, r) {
  if (w <= 0 || r <= 0) return 0;
  return Math.round(w * (1 + r / 30) * 10) / 10;
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

/** 現在の utils/training.ts reconcileTrainingLogPRs と同一 */
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

function resolveIsPR(exerciseId, rm, logs) {
  if (!rm || rm <= 0) return false;
  const prior = getPriorBest1RM(logs, exerciseId);
  return prior > 0 && rm > prior;
}

/** 本番 utils/training.ts buildExerciseLog と同一 */
function buildExerciseLog(exerciseId, exerciseName, sets, logs) {
  const rmVal = getBest1RMFromSets(sets);
  const rm = rmVal > 0 ? rmVal : undefined;
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

function toSets(w, r) {
  return [{ setNumber: 1, weightKg: w, reps: r, completed: true }];
}

function saveExerciseLog(logs, { date, workoutId, exerciseId, exerciseName, sets }) {
  const idx = logs.findIndex((l) => l.date === date && l.workoutId === workoutId);
  const built = buildExerciseLog(exerciseId, exerciseName, sets, logs);
  const existing =
    idx >= 0
      ? { ...logs[idx], exerciseLogs: [...(logs[idx].exerciseLogs ?? [])] }
      : { date, workoutId, completedExercises: [], exerciseLogs: [] };

  const li = existing.exerciseLogs.findIndex((e) => e.exerciseId === exerciseId);
  if (li >= 0) existing.exerciseLogs[li] = built;
  else existing.exerciseLogs.push(built);

  const nextLogs = [...logs];
  if (idx >= 0) nextLogs[idx] = existing;
  else nextLogs.push(existing);

  const reconciled = reconcileTrainingLogPRs(nextLogs);
  const saved = reconciled
    .find((l) => l.date === date && l.workoutId === workoutId)
    ?.exerciseLogs?.find((e) => e.exerciseId === exerciseId);

  return {
    nextLogs: reconciled,
    built,
    saved,
    ui: saved?.isPR ? "🔥 自己ベスト更新！" : "保存しました",
  };
}

const EX = { id: "incline-bench", name: "インクラインベンチ" };
const WO = "chest-triceps";
const D1 = "2026-08-26";
const D2 = "2026-08-27";

let logs = [];

function case1() {
  const r0 = saveExerciseLog(logs, { date: D1, workoutId: WO, exerciseId: EX.id, exerciseName: EX.name, sets: toSets(50, 10) });
  logs = r0.nextLogs;
  const r = saveExerciseLog(logs, { date: D1, workoutId: WO, exerciseId: EX.id, exerciseName: EX.name, sets: toSets(52.5, 10) });
  logs = r.nextLogs;
  return {
    num: 1,
    title: "初回保存で自己ベスト更新（同日2回目で記録更新）",
    exercise: EX.name,
    weight: 52.5,
    reps: 10,
    operation: "50kg×10 保存 → 52.5kg×10 保存",
    expected: "🔥 自己ベスト更新！",
    buildIsPR: r.built.isPR,
    priorBest1RM: r.built.priorBest1RM,
    reconcileIsPR: r.saved.isPR,
    actual: r.ui,
    pass: r.saved.isPR === true && r.ui === "🔥 自己ベスト更新！",
  };
}

function case2() {
  const r = saveExerciseLog(logs, { date: D1, workoutId: WO, exerciseId: EX.id, exerciseName: EX.name, sets: toSets(52.5, 10) });
  logs = r.nextLogs;
  return {
    num: 2,
    title: "同じ内容を再保存",
    exercise: EX.name,
    weight: 52.5,
    reps: 10,
    operation: "52.5kg×10 変更なしで再保存",
    expected: "保存しました",
    buildIsPR: r.built.isPR,
    priorBest1RM: r.built.priorBest1RM,
    reconcileIsPR: r.saved.isPR,
    actual: r.ui,
    pass: r.saved.isPR === false && r.ui === "保存しました",
  };
}

function case3() {
  const r = saveExerciseLog(logs, { date: D1, workoutId: WO, exerciseId: EX.id, exerciseName: EX.name, sets: toSets(55, 10) });
  logs = r.nextLogs;
  return {
    num: 3,
    title: "同日で重量・回数を更新して自己ベスト更新",
    exercise: EX.name,
    weight: 55,
    reps: 10,
    operation: "55kg×10 に変更して保存",
    expected: "🔥 自己ベスト更新！",
    buildIsPR: r.built.isPR,
    priorBest1RM: r.built.priorBest1RM,
    reconcileIsPR: r.saved.isPR,
    actual: r.ui,
    pass: r.saved.isPR === true && r.ui === "🔥 自己ベスト更新！",
  };
}

function case4() {
  const r = saveExerciseLog(logs, { date: D2, workoutId: WO, exerciseId: EX.id, exerciseName: EX.name, sets: toSets(57.5, 10) });
  logs = r.nextLogs;
  return {
    num: 4,
    title: "別日に過去ベスト更新",
    exercise: EX.name,
    weight: 57.5,
    reps: 10,
    operation: `別日 ${D2} に 57.5kg×10 保存`,
    expected: "🔥 自己ベスト更新！",
    buildIsPR: r.built.isPR,
    priorBest1RM: r.built.priorBest1RM,
    reconcileIsPR: r.saved.isPR,
    actual: r.ui,
    pass: r.saved.isPR === true && r.ui === "🔥 自己ベスト更新！",
  };
}

console.log("=== 本番コード同一フロー再検証（saveExerciseLog → reconcile → UI）===\n");

const results = [case1(), case2(), case3(), case4()];
let failed = 0;

for (const r of results) {
  console.log(`【ケース${r.num}】${r.title}`);
  console.log(`  種目: ${r.exercise}`);
  console.log(`  重量: ${r.weight}kg / 回数: ${r.reps}`);
  console.log(`  操作: ${r.operation}`);
  console.log(`  期待: ${r.expected}`);
  console.log(`  buildExerciseLog.isPR: ${r.buildIsPR}`);
  console.log(`  buildExerciseLog.priorBest1RM: ${r.priorBest1RM ?? "未設定"}`);
  console.log(`  reconcile後 isPR: ${r.reconcileIsPR}`);
  console.log(`  実際の表示: ${r.actual}`);
  console.log(`  判定: ${r.pass ? "OK" : "FAIL"}\n`);
  if (!r.pass) failed++;
}

if (failed > 0) {
  console.log("--- isPR が true→false に変わる箇所 ---");
  console.log("  Step1 buildExerciseLog: resolveIsPR（マージ前 logs）→ ケース1/3 では true");
  console.log("  Step2 saveExerciseLog: 同日同種目を上書き → 旧記録が logs から消える");
  console.log("  Step3 reconcileTrainingLogPRs: priorBest1RM 未設定 → runningBest 走査 → false");
  console.log("  Step4 ExerciseLogPanel: saved.isPR（reconcile後）で表示 → 🔥 出ない");
  console.log("\n  根本原因: buildExerciseLog が priorBest1RM を保存していない");
  console.log("  （reconcile の priorBest1RM 分岐は追加済みだが、値が渡っていない）");
}

process.exit(failed === 0 ? 0 : 1);

/**
 * PR判定値の追跡: buildExerciseLog → merge → reconcile → UI
 * ケース1（同日2回目で記録更新）を再現
 */

function estimate1RM(w, r) {
  return Math.round(w * (1 + r / 30) * 10) / 10;
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

function resolveIsPR(exerciseId, rm, logs) {
  if (!rm || rm <= 0) return false;
  const prior = getPriorBest1RM(logs, exerciseId);
  return prior > 0 && rm > prior;
}

function reconcileOld(logs) {
  const byEx = new Map();
  for (const log of logs) {
    for (const ex of log.exerciseLogs ?? []) {
      const list = byEx.get(ex.exerciseId) ?? [];
      list.push({ log, ex });
      byEx.set(ex.exerciseId, list);
    }
  }
  const prByKey = new Map();
  for (const entries of byEx.values()) {
    entries.sort((a, b) => a.log.date.localeCompare(b.log.date));
    let runningBest = 0;
    for (const { log, ex } of entries) {
      const rm = ex.estimated1RM ?? 0;
      const isPR = rm > 0 && runningBest > 0 && rm > runningBest;
      prByKey.set(`${log.date}|${ex.exerciseId}|${ex.savedAt}`, isPR);
      if (rm > 0) runningBest = Math.max(runningBest, rm);
    }
  }
  return prByKey;
}

console.log("=== PR判定値の追跡（同日: 50×10 → 52.5×10）===\n");

// Step 1: 1回目保存後の状態
const afterSave1 = [{
  date: "2026-08-26",
  workoutId: "chest-triceps",
  exerciseLogs: [{ exerciseId: "incline-bench", estimated1RM: estimate1RM(50, 10), savedAt: "t1" }],
}];
console.log("【1回目保存後】logs:", JSON.stringify(afterSave1[0].exerciseLogs[0].estimated1RM), "kg");

// Step 2: buildExerciseLog（2回目保存前・マージ前 logs）
const rm2 = estimate1RM(52.5, 10);
const buildIsPR = resolveIsPR("incline-bench", rm2, afterSave1);
console.log("\n【Step A: buildExerciseLog / resolveIsPR】");
console.log("  マージ前 logs に含まれる過去最高:", getPriorBest1RM(afterSave1, "incline-bench"), "kg");
console.log("  今回 1RM:", rm2, "kg");
console.log("  isPR:", buildIsPR, " ← ここでは true");

// Step 3: merge（同日同種目は上書き）
const afterMerge = [{
  date: "2026-08-26",
  workoutId: "chest-triceps",
  exerciseLogs: [{ exerciseId: "incline-bench", estimated1RM: rm2, savedAt: "t2" }],
}];
console.log("\n【Step B: saveExerciseLog マージ（上書き）】");
console.log("  66.7kg の旧記録が消える → logs には 70kg の1件のみ");

// Step 4: reconcile
const prMap = reconcileOld(afterMerge);
const reconcileIsPR = prMap.get("2026-08-26|incline-bench|t2");
console.log("\n【Step C: reconcileTrainingLogPRs】");
console.log("  runningBest=0 から走査開始（当該種目の唯一の記録）");
console.log("  isPR:", reconcileIsPR, " ← ここで false に上書き");

// Step 5: UI
console.log("\n【Step D: ExerciseLogPanel】");
console.log("  saved.isPR =", reconcileIsPR, "→ 表示:", reconcileIsPR ? "🔥 自己ベスト更新！" : "保存しました");

console.log("\n【原因】");
console.log("  reconcile は「保存後 logs」だけを時系列走査するため、");
console.log("  同日上書きで消えた旧記録（66.7kg）を参照できない。");

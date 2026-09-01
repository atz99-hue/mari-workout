/** トレーニングロジックの手動検証（保存処理・データ構造は触らない） */

function estimate1RM(weightKg, reps) {
  if (weightKg <= 0 || weightKg > 500 || reps < 1 || reps > 30) return 0;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

function getBest1RMFromSets(sets) {
  let best = 0;
  for (const s of sets) {
    if (s.completed && s.weightKg > 0 && s.weightKg <= 500 && s.reps >= 1 && s.reps <= 30) {
      best = Math.max(best, estimate1RM(s.weightKg, s.reps));
    }
  }
  return best;
}

function buildIsPR(estimated1RM, historicalBest, todayBest) {
  const baseline = Math.max(historicalBest, todayBest);
  return estimated1RM > 0 && baseline > 0 && estimated1RM > baseline;
}

function parseWeightInput(input) {
  const trimmed = input.trim();
  if (!trimmed || trimmed === ".") return 0;
  const num = parseFloat(trimmed);
  return Number.isFinite(num) ? num : 0;
}

const tests = [];

function assert(name, cond) {
  tests.push({ name, pass: !!cond });
}

// 1RM Epley
assert("100kg×5 → 116.7", estimate1RM(100, 5) === 116.7);
assert("67.25kg×8 → 85.2", estimate1RM(67.25, 8) === 85.2);
assert("62.5kg×10 → 83.3", estimate1RM(62.5, 10) === 83.3);

// 小数入力
assert("parse 50.", parseWeightInput("50.") === 50);
assert("parse 67.25", parseWeightInput("67.25") === 67.25);
assert("parse empty", parseWeightInput("") === 0);

// セットから最大1RM
const sets = [
  { completed: true, weightKg: 80, reps: 8 },
  { completed: true, weightKg: 82.5, reps: 6 },
];
assert("best 1RM from sets (80×8 wins)", getBest1RMFromSets(sets) === estimate1RM(80, 8));

// PR判定
assert("初記録はPRにならない", !buildIsPR(100, 0, 0));
assert("2回目で更新はPR", buildIsPR(110, 100, 0));
assert("同日再保存で未更新は非PR", !buildIsPR(105, 100, 105));
assert("同日再保存で更新はPR", buildIsPR(112, 100, 110));

function validateReps(reps) {
  return Number.isInteger(reps) && reps >= 1 && reps <= 30;
}
function isOutlier(repList) {
  const reps = [...repList].sort((a, b) => a - b);
  if (reps.length < 2) return false;
  const max = reps[reps.length - 1];
  const next = reps[reps.length - 2];
  return max > next * 2 && max - next >= 10;
}
assert("回数30は可", validateReps(30));
assert("回数50は不可", !validateReps(50));
assert("50×50は1RMに使わない", estimate1RM(50, 50) === 0);
assert("10/10/50は外れ値", isOutlier([10, 10, 50]));
assert("10/10/12は外れ値でない", !isOutlier([10, 10, 12]));

const failed = tests.filter((t) => t.pass === false);
for (const t of tests) {
  console.log(`${t.pass ? "OK" : "FAIL"}: ${t.name}`);
}
console.log(failed.length === 0 ? "\nAll passed" : `\n${failed.length} failed`);
process.exit(failed.length === 0 ? 0 : 1);

/**
 * resetAppDataToDefault の検証
 * trainingLogs / exerciseLogs / priorBest1RM が初期化されること
 */

function createDefaultAppData() {
  return {
    settings: { userName: "ゲスト", dailyCalorieGoal: 2000, dailyProteinGoal: 120 },
    weights: [],
    meals: [],
    trainingLogs: [],
    chatHistory: [],
  };
}

const STORAGE_KEY = "@mari_fitness_data";
const STORAGE_VERSION = 4;

/** storage/index.ts resetAppDataToDefault と同一 */
async function resetAppDataToDefault(store) {
  const fresh = createDefaultAppData();
  await store.removeItem(STORAGE_KEY);
  await store.setItem(STORAGE_KEY, JSON.stringify({ ...fresh, _version: STORAGE_VERSION }));
  return fresh;
}

/** persist 競合を再現: reset 後に旧 persist が書き戻す */
async function simulatePersistRace(store) {
  const oldData = {
    settings: { userName: "テスト", dailyCalorieGoal: 2000, dailyProteinGoal: 120 },
    weights: [{ id: "1", date: "2026-08-27", weight: 70 }],
    meals: [],
    trainingLogs: [
      {
        date: "2026-08-27",
        workoutId: "chest-triceps",
        completedExercises: ["incline-bench"],
        exerciseLogs: [
          {
            exerciseId: "incline-bench",
            exerciseName: "インクラインベンチ",
            sets: [{ setNumber: 1, weightKg: 52.5, reps: 10, completed: true }],
            estimated1RM: 70,
            priorBest1RM: 66.7,
            isPR: true,
            savedAt: "2026-08-27T10:00:00.000Z",
          },
        ],
      },
    ],
    chatHistory: [{ id: "1", role: "user", content: "hi", timestamp: "t" }],
    todayWorkoutOverride: { date: "2026-08-27", workoutId: "legs" },
  };

  await store.setItem(STORAGE_KEY, JSON.stringify({ ...oldData, _version: STORAGE_VERSION }));

  let generation = 0;

  async function persist(data) {
    const genAtStart = generation;
    if (genAtStart !== generation) return;
    await store.setItem(STORAGE_KEY, JSON.stringify({ ...data, _version: STORAGE_VERSION }));
    if (genAtStart !== generation) return;
  }

  async function resetAllData() {
    generation += 1;
    return resetAppDataToDefault(store);
  }

  const slowPersist = persist(oldData);
  await resetAllData();
  await slowPersist;

  const raw = await store.getItem(STORAGE_KEY);
  const parsed = JSON.parse(raw);
  return parsed;
}

function createMemoryStore() {
  const map = new Map();
  return {
    async getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    async setItem(key, value) {
      map.set(key, value);
    },
    async removeItem(key) {
      map.delete(key);
    },
  };
}

async function run() {
  const store = createMemoryStore();
  const fresh = await resetAppDataToDefault(store);

  const tests = [
    ["trainingLogs が空", fresh.trainingLogs.length === 0],
    ["chatHistory が空", fresh.chatHistory.length === 0],
    ["weights が空", fresh.weights.length === 0],
    ["todayWorkoutOverride なし", fresh.todayWorkoutOverride === undefined],
    [
      "AsyncStorage に空データ",
      await (async () => {
        const raw = await store.getItem(STORAGE_KEY);
        const p = JSON.parse(raw);
        return p.trainingLogs.length === 0 && !p.todayWorkoutOverride;
      })(),
    ],
  ];

  const afterRace = await simulatePersistRace(createMemoryStore());
  tests.push(["reset 後に旧 persist が書き戻さない", afterRace.trainingLogs.length === 0]);
  tests.push([
    "reset 後 exerciseLogs なし",
    !afterRace.trainingLogs?.some((l) => (l.exerciseLogs?.length ?? 0) > 0),
  ]);

  let failed = 0;
  for (const [name, pass] of tests) {
    console.log(`${pass ? "OK" : "FAIL"}: ${name}`);
    if (!pass) failed++;
  }
  process.exit(failed === 0 ? 0 : 1);
}

run();

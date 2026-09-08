import { AppData, ChatMessage, MealEntry, WeightEntry } from "../types";
import { todayKey } from "../storage";
import { resolveTodayWorkout } from "../constants/workouts";

type Context = {
  latestWeight?: number;
  todayMeals: MealEntry[];
  todayCalories: number;
  completedExercises: number;
  totalExercises: number;
  todayPRCount: number;
  todayExerciseSummary: string;
};

function buildContext(data: AppData): Context {
  const today = todayKey();
  const sortedWeights = [...data.weights].sort((a, b) => b.date.localeCompare(a.date));
  const todayMeals = data.meals.filter((m) => m.date === today);
  const todayCalories = todayMeals.reduce((sum, m) => sum + (m.calories ?? 0), 0);
  const workout = resolveTodayWorkout(data.todayWorkoutOverride);
  const todayLog = data.trainingLogs.find(
    (l) => l.date === today && l.workoutId === workout.id
  );
  const exerciseLogs = todayLog?.exerciseLogs ?? [];
  const todayPRCount = new Set(
    exerciseLogs.filter((e) => e.isPR).map((e) => e.exerciseId)
  ).size;
  const todayExerciseSummary = exerciseLogs
    .filter((e) => e.estimated1RM)
    .map((e) => `${e.exerciseName}:1RM${e.estimated1RM}kg${e.isPR ? "(PR)" : ""}`)
    .join(", ");

  return {
    latestWeight: sortedWeights[0]?.weight,
    todayMeals,
    todayCalories,
    completedExercises: todayLog?.completedExercises.length ?? 0,
    totalExercises: workout.exercises.length,
    todayPRCount,
    todayExerciseSummary: todayExerciseSummary || "未記録",
  };
}

function localMariReply(message: string, data: AppData): string {
  const ctx = buildContext(data);
  const lower = message.toLowerCase();

  if (/体重|weight/.test(message)) {
    if (ctx.latestWeight) {
      return `最新の体重は ${ctx.latestWeight}kg です。毎日同じ時間に測ると正確な推移がわかりますよ！`;
    }
    return "体重の記録がまだありません。体重画面から記録してみましょう！";
  }

  if (/食事|カロリー|meal|protein|タンパク/.test(message)) {
    if (ctx.todayMeals.length === 0) {
      return "今日の食事記録はまだありません。食事管理画面から記録を始めましょう。タンパク質は筋肉の材料になるので意識してみてくださいね！";
    }
    return `今日は ${ctx.todayMeals.length} 件の食事を記録しています（合計 ${ctx.todayCalories} kcal）。タンパク質を意識した食事が筋トレの成果を高めますよ！`;
  }

  if (/トレーニング|筋トレ|workout|種目|1rm|重量/.test(message)) {
    if (ctx.completedExercises > 0 || ctx.todayExerciseSummary !== "未記録") {
      const prNote = ctx.todayPRCount > 0 ? ` PR ${ctx.todayPRCount}件更新！` : "";
      const detail =
        ctx.todayExerciseSummary !== "未記録"
          ? ` 記録: ${ctx.todayExerciseSummary}。`
          : "";
      return `今日は ${ctx.completedExercises} 種目完了していますね！${prNote}${detail}フォームを意識しながら、無理のない重量で続けましょう。`;
    }
    return "今日のトレーニングはまだ始まっていないようです。まずはウォームアップから始めましょう！";
  }

  if (/休息|休み|rest|睡眠/.test(message)) {
    return "休息もトレーニングの一部です。筋肉は休んでいる間に成長します。7〜8時間の睡眠と、休息日の軽いストレッチを意識してみてください。";
  }

  if (/こんにちは|hello|hi|マリ/.test(lower) || message.includes("はじめ")) {
    const name = data.settings?.userName ?? "ゲスト";
    return `${name}さん、こんにちは！AIマリです ✨ トレーニング、食事、体重について何でも相談してください。一緒に目標に向かって頑張りましょう！`;
  }

  if (/モチベ|やる気|motivat/.test(message)) {
    return "継続は力なり！小さな一歩でも毎日積み重ねれば必ず結果が出ます。今日できることから始めましょう。応援しています！";
  }

  if (/プロテイン|supplement|サプリ/.test(message)) {
    return "プロテインは食事でタンパク質が足りない時の補助として有効です。まずは食事から十分なタンパク質（体重×1.6〜2g/日）を摂ることを目指しましょう。";
  }

  return "ご質問ありがとうございます！トレーニングの組み方、食事、体重管理など、具体的に聞いていただけるとより的確にお答えできます。今日の体調はいかがですか？";
}

export async function askMari(message: string, data: AppData): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

  if (apiKey) {
    try {
      const ctx = buildContext(data);
      const name = data.settings?.userName ?? "ユーザー";
      const systemPrompt = `あなたは「マリ」という高級感のあるAIフィットネスコーチです。${name}さんに日本語で簡潔に（150字以内）回答してください。
ユーザーデータ: 最新体重=${ctx.latestWeight ?? "未記録"}kg, 目標体重=${data.settings?.targetWeight ?? "未設定"}kg, 今日の食事=${ctx.todayMeals.length}件(${ctx.todayCalories}kcal/${data.settings?.dailyCalorieGoal ?? 2000}kcal), 今日完了種目=${ctx.completedExercises}/${ctx.totalExercises}件, 今日のトレーニング記録=${ctx.todayExerciseSummary}, PR=${ctx.todayPRCount}件`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          max_tokens: 200,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        const reply = json.choices?.[0]?.message?.content?.trim();
        if (reply) return reply;
      }
    } catch {
      // fall through to local reply
    }
  }

  return localMariReply(message, data);
}

export function createChatMessage(role: "user" | "assistant", content: string): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    content,
    timestamp: new Date().toISOString(),
  };
}

export function createWeightEntry(weight: number, memo?: string): WeightEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: todayKey(),
    weight,
    memo: memo || undefined,
  };
}

export function createMealEntry(
  name: string,
  calories?: number,
  protein?: number,
  memo?: string
): MealEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: todayKey(),
    name,
    calories: calories || undefined,
    protein: protein || undefined,
    memo: memo || undefined,
  };
}

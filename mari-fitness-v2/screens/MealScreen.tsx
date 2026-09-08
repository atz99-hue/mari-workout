import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Alert, Keyboard, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { ProgressRing } from "../components/ProgressRing";
import { ScreenLayout, Section } from "../components/ScreenLayout";
import { TextField } from "../components/TextField";
import { borderRadius, colors, gradients, spacing, typography } from "../constants/theme";
import { AppSettings, MealEntry } from "../types";

type Props = {
  onBack: () => void;
  meals: MealEntry[];
  settings: AppSettings;
  onSave: (name: string, calories?: number, protein?: number, memo?: string) => void;
  onDelete: (id: string) => void;
};

export function MealScreen({ onBack, meals, settings, onSave, onDelete }: Props) {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [memo, setMemo] = useState("");

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("入力エラー", "食事名を入力してください");
      return;
    }
    const cal = calories ? parseInt(calories, 10) : undefined;
    const pro = protein ? parseInt(protein, 10) : undefined;
    onSave(name.trim(), cal, pro, memo.trim() || undefined);
    Keyboard.dismiss();
    setName("");
    setCalories("");
    setProtein("");
    setMemo("");
    Alert.alert("保存しました", "食事を記録しました");
  };

  const handleDelete = (meal: MealEntry) => {
    Alert.alert("食事を削除", `「${meal.name}」を削除しますか？`, [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: () => onDelete(meal.id),
      },
    ]);
  };

  const todayTotal = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.calories ?? 0),
      protein: acc.protein + (m.protein ?? 0),
    }),
    { calories: 0, protein: 0 }
  );

  const calProgress = Math.min(
    100,
    Math.round((todayTotal.calories / settings.dailyCalorieGoal) * 100)
  );
  const proteinProgress = Math.min(
    100,
    Math.round((todayTotal.protein / settings.dailyProteinGoal) * 100)
  );

  return (
    <ScreenLayout title="Nutrition" subtitle="🍽 食事管理" onBack={onBack}>
      <LinearGradient colors={[...gradients.card]} style={styles.hero}>
        <Text style={styles.heroLabel}>TODAY'S INTAKE</Text>
        <View style={styles.heroRow}>
          <View style={styles.heroStat}>
            <Text style={styles.heroValue}>{todayTotal.calories}</Text>
            <Text style={styles.heroUnit}>kcal</Text>
            <Text style={styles.heroTarget}>目標 {settings.dailyCalorieGoal}</Text>
          </View>
          <ProgressRing progress={calProgress} size={80} label="kcal" />
          <View style={styles.heroStat}>
            <Text style={styles.heroValue}>{todayTotal.protein}</Text>
            <Text style={styles.heroUnit}>g</Text>
            <Text style={styles.heroTarget}>目標 {settings.dailyProteinGoal}g</Text>
          </View>
          <ProgressRing progress={proteinProgress} size={80} label="P" />
        </View>
        <View style={styles.barTrack}>
          <LinearGradient
            colors={[colors.goldDark, colors.gold, colors.goldLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.barFill, { width: `${calProgress}%` }]}
          />
        </View>
        <Text style={styles.heroSub}>{meals.length} 件記録済み</Text>
      </LinearGradient>

      <Section title="記録する">
        <View style={styles.form}>
          <TextField
            label="食事名 *"
            value={name}
            onChangeText={setName}
            placeholder="例: 鶏胸肉サラダ"
          />
          <View style={styles.row}>
            <View style={styles.half}>
              <TextField
                label="カロリー (kcal)"
                value={calories}
                onChangeText={setCalories}
                keyboardType="number-pad"
                placeholder="500"
              />
            </View>
            <View style={styles.half}>
              <TextField
                label="タンパク質 (g)"
                value={protein}
                onChangeText={setProtein}
                keyboardType="number-pad"
                placeholder="30"
              />
            </View>
          </View>
          <TextField
            label="メモ（任意）"
            value={memo}
            onChangeText={setMemo}
            placeholder="外食、自炊 など"
          />
          <PrimaryButton label="記録する" onPress={handleSave} />
        </View>
      </Section>

      <Section title="今日の食事">
        {meals.length === 0 ? (
          <Text style={styles.empty}>まだ記録がありません</Text>
        ) : (
          meals.map((meal) => (
            <View key={meal.id} style={styles.mealRow}>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{meal.name}</Text>
                {meal.memo ? <Text style={styles.mealMemo}>{meal.memo}</Text> : null}
              </View>
              <Text style={styles.mealDetail}>
                {[meal.calories ? `${meal.calories}kcal` : null, meal.protein ? `P${meal.protein}g` : null]
                  .filter(Boolean)
                  .join(" / ") || "—"}
              </Text>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(meal)}
                hitSlop={8}
              >
                <Text style={styles.deleteText}>×</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </Section>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderGold,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  heroLabel: {
    ...typography.label,
    color: colors.gold,
    marginBottom: spacing.md,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  heroStat: {
    alignItems: "center",
    flex: 1,
  },
  heroValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700",
  },
  heroUnit: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  heroTarget: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
  barTrack: {
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.full,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  barFill: {
    height: "100%",
    borderRadius: borderRadius.full,
  },
  heroSub: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
  },
  form: {
    backgroundColor: colors.surfaceSolid,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  half: {
    flex: 1,
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  mealRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  mealInfo: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  mealName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  mealMemo: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 3,
  },
  mealDetail: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: "600",
    marginRight: spacing.sm,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: {
    color: colors.error,
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 20,
  },
});

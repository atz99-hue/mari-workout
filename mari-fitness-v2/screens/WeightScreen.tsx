import { useState } from "react";
import { Alert, Keyboard, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenLayout, Section } from "../components/ScreenLayout";
import { TextField } from "../components/TextField";
import { WeightChart } from "../components/WeightChart";
import { borderRadius, colors, spacing, typography } from "../constants/theme";
import { AppSettings, WeightEntry } from "../types";
import { formatDate } from "../utils/date";

type Props = {
  onBack: () => void;
  weights: WeightEntry[];
  settings: AppSettings;
  onSave: (weight: number, memo?: string) => void;
};

export function WeightScreen({ onBack, weights, settings, onSave }: Props) {
  const [input, setInput] = useState("");
  const [memo, setMemo] = useState("");

  const handleSave = () => {
    const value = parseFloat(input);
    if (isNaN(value) || value <= 0 || value > 500) {
      Alert.alert("入力エラー", "有効な体重（0〜500kg）を入力してください");
      return;
    }
    onSave(value, memo.trim() || undefined);
    Keyboard.dismiss();
    setInput("");
    setMemo("");
    Alert.alert("記録完了", `${value} kg を保存しました`);
  };

  const sorted = [...weights].sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted[0];

  return (
    <ScreenLayout title="Weight" subtitle="体重管理 & 推移グラフ" onBack={onBack}>
      {latest ? (
        <View style={styles.heroStat}>
          <Text style={styles.heroLabel}>CURRENT</Text>
          <Text style={styles.heroValue}>
            {latest.weight}
            <Text style={styles.heroUnit}> kg</Text>
          </Text>
          {settings.targetWeight ? (
            <Text style={styles.heroTarget}>
              目標 {settings.targetWeight} kg（差 {Math.abs(latest.weight - settings.targetWeight).toFixed(1)} kg）
            </Text>
          ) : null}
        </View>
      ) : null}

      <WeightChart entries={weights} targetWeight={settings.targetWeight} />

      <Section title="記録する">
        <View style={styles.form}>
          <TextField
            label="今日の体重 (kg)"
            value={input}
            onChangeText={setInput}
            keyboardType="decimal-pad"
            placeholder="74.5"
          />
          <TextField
            label="メモ（任意）"
            value={memo}
            onChangeText={setMemo}
            placeholder="朝食前、体調良好 など"
          />
          <PrimaryButton label="記録する" onPress={handleSave} />
        </View>
      </Section>

      <Section title="履歴">
        {sorted.length === 0 ? (
          <Text style={styles.empty}>まだ記録がありません</Text>
        ) : (
          sorted.slice(0, 14).map((entry) => (
            <View key={entry.id} style={styles.historyRow}>
              <View>
                <Text style={styles.historyDate}>{formatDate(entry.date)}</Text>
                {entry.memo ? <Text style={styles.historyMemo}>{entry.memo}</Text> : null}
              </View>
              <Text style={styles.historyWeight}>{entry.weight} kg</Text>
            </View>
          ))
        )}
      </Section>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  heroStat: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  heroLabel: {
    ...typography.label,
    color: colors.gold,
    marginBottom: spacing.xs,
  },
  heroValue: {
    fontSize: 48,
    fontWeight: "200",
    color: colors.text,
    letterSpacing: -1,
  },
  heroUnit: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  heroTarget: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  form: {
    backgroundColor: colors.surfaceSolid,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  historyRow: {
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
  historyDate: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "500",
  },
  historyMemo: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  historyWeight: {
    color: colors.gold,
    fontSize: 20,
    fontWeight: "700",
  },
});

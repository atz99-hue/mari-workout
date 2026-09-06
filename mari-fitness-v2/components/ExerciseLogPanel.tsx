import { useEffect, useState } from "react";
import { Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { PrimaryButton } from "./PrimaryButton";
import { ComparisonBadge } from "./ComparisonBadge";
import { borderRadius, colors, spacing, typography } from "../constants/theme";
import { ExerciseLog, SetRecord } from "../types";
import {
  compareExercise,
  createEmptySets,
  parseRepsInput,
  parseTargetSetCount,
  parseWeightInput,
  sanitizeWeightInput,
  validateExerciseSets,
} from "../utils/training";

type Props = {
  exerciseId: string;
  exerciseName: string;
  setsLabel?: string;
  todayLog?: ExerciseLog;
  previousLog?: ExerciseLog;
  onSave: (sets: SetRecord[]) => Promise<ExerciseLog | undefined>;
  onPersonalRecord?: () => void;
};

/** 入力中のセット状態（重量は文字列で保持） */
type SetDraft = {
  setNumber: number;
  weightInput: string;
  reps: number;
  completed: boolean;
};

function formatWeightInput(weightKg: number): string {
  if (weightKg <= 0) return "";
  return String(weightKg);
}

function recordsToDrafts(sets: SetRecord[]): SetDraft[] {
  return sets.map((s) => ({
    setNumber: s.setNumber,
    weightInput: formatWeightInput(s.weightKg),
    reps: s.reps,
    completed: s.completed,
  }));
}

function createEmptyDrafts(count: number): SetDraft[] {
  return createEmptySets(count).map((s) => ({
    setNumber: s.setNumber,
    weightInput: "",
    reps: s.reps,
    completed: s.completed,
  }));
}

function draftsToRecords(drafts: SetDraft[]): SetRecord[] {
  return drafts.map((d) => {
    const weightKg = parseWeightInput(d.weightInput);
    const reps = parseRepsInput(String(d.reps || ""));
    return {
      setNumber: d.setNumber,
      weightKg,
      reps,
      completed: reps > 0 ? true : d.completed,
    };
  });
}

function renumberDrafts(drafts: SetDraft[]): SetDraft[] {
  return drafts.map((s, i) => ({ ...s, setNumber: i + 1 }));
}

function renumberRecords(records: SetRecord[]): SetRecord[] {
  return records.map((s, i) => ({ ...s, setNumber: i + 1 }));
}

function hasSavedSets(log?: ExerciseLog): boolean {
  return !!log?.sets?.some((s) => s.reps > 0);
}

export function ExerciseLogPanel({
  exerciseId,
  exerciseName,
  setsLabel,
  todayLog,
  previousLog,
  onSave,
  onPersonalRecord,
}: Props) {
  const defaultCount = parseTargetSetCount(setsLabel);
  const [sets, setSets] = useState<SetDraft[]>(() =>
    todayLog?.sets?.length ? recordsToDrafts(todayLog.sets) : createEmptyDrafts(defaultCount)
  );
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  useEffect(() => {
    if (todayLog?.sets?.length) {
      setSets(recordsToDrafts(todayLog.sets));
    }
  }, [exerciseId, todayLog?.savedAt]);

  const comparison = compareExercise(todayLog, previousLog);

  const updateWeight = (index: number, value: string) => {
    const weightInput = sanitizeWeightInput(value);
    setFeedback(null);
    setSets((prev) =>
      prev.map((s, i) => (i === index ? { ...s, weightInput } : s))
    );
  };

  const updateReps = (index: number, value: string) => {
    const reps = parseRepsInput(value);
    setFeedback(null);
    setSets((prev) =>
      prev.map((s, i) => (i === index ? { ...s, reps } : s))
    );
  };

  const toggleSetComplete = (index: number) => {
    setFeedback(null);
    setSets((prev) =>
      prev.map((s, i) => (i === index ? { ...s, completed: !s.completed } : s))
    );
  };

  const addSet = () => {
    setSets((prev) =>
      renumberDrafts([
        ...prev,
        { setNumber: prev.length + 1, weightInput: "", reps: 0, completed: false },
      ])
    );
  };

  const removeSet = (index: number) => {
    setFeedback(null);
    setSets((prev) => {
      if (prev.length <= 1) return prev;
      return renumberDrafts(prev.filter((_, i) => i !== index));
    });
  };

  const handleSave = async () => {
    const normalized = renumberRecords(draftsToRecords(sets));
    const validation = validateExerciseSets(normalized);
    if (!validation.ok) {
      setFeedback({ type: "error", message: validation.message });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      const saved = await onSave(normalized);
      if (!saved) {
        setFeedback({ type: "error", message: "保存に失敗しました。もう一度お試しください" });
        return;
      }
      Keyboard.dismiss();
      setSets(recordsToDrafts(saved.sets));
      if (saved.isPR) {
        onPersonalRecord?.();
        setFeedback({ type: "success", message: "🔥 自己ベスト更新！" });
      } else {
        setFeedback({ type: "success", message: "保存しました" });
      }
    } catch {
      setFeedback({ type: "error", message: "保存に失敗しました。もう一度お試しください" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.panel}>
      {previousLog?.estimated1RM ? (
        <Text style={styles.prevHint}>
          前回: 推定1RM {previousLog.estimated1RM}kg
        </Text>
      ) : null}

      {sets.map((set, index) => (
        <View key={`set-${index}`} style={styles.setRow}>
          <TouchableOpacity
            style={[styles.setCheck, set.completed && styles.setCheckDone]}
            onPress={() => toggleSetComplete(index)}
          >
            <Text style={styles.setCheckText}>{set.completed ? "✓" : set.setNumber}</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={set.weightInput}
            onChangeText={(v) => updateWeight(index, v)}
            keyboardType="decimal-pad"
            placeholder="kg"
            placeholderTextColor={colors.textSecondary}
          />
          <Text style={styles.times}>×</Text>
          <TextInput
            style={styles.input}
            value={set.reps > 0 ? String(set.reps) : ""}
            onChangeText={(v) => updateReps(index, v)}
            keyboardType="number-pad"
            placeholder="回"
            placeholderTextColor={colors.textSecondary}
          />
          {sets.length > 1 ? (
            <TouchableOpacity
              onPress={() => removeSet(index)}
              style={styles.removeBtn}
              hitSlop={8}
            >
              <Text style={styles.removeText}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ))}

      <TouchableOpacity onPress={addSet} style={styles.addSetBtn}>
        <Text style={styles.addSetText}>+ セット追加</Text>
      </TouchableOpacity>

      <PrimaryButton label="セットを保存" onPress={handleSave} loading={saving} />

      {feedback ? (
        <Text
          style={[
            styles.feedback,
            feedback.type === "success" ? styles.feedbackSuccess : styles.feedbackError,
          ]}
        >
          {feedback.message}
        </Text>
      ) : null}

      {hasSavedSets(todayLog) ? (
        todayLog?.estimated1RM ? (
          <ComparisonBadge comparison={comparison} />
        ) : (
          <Text style={styles.savedHint}>✓ 記録済み（重量を入力すると1RMを計算します）</Text>
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  prevHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  setCheck: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderGold,
    alignItems: "center",
    justifyContent: "center",
  },
  setCheckDone: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  setCheckText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    color: colors.text,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    fontSize: 15,
    textAlign: "center",
  },
  times: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  addSetBtn: {
    alignItems: "center",
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  addSetText: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: "600",
  },
  removeBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  feedback: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
    marginTop: spacing.sm,
  },
  feedbackSuccess: {
    color: colors.success,
  },
  feedbackError: {
    color: "#f87171",
  },
  savedHint: {
    color: colors.success,
    fontSize: 12,
    marginTop: spacing.sm,
    textAlign: "center",
  },
});

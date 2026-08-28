import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ComparisonBadge } from "../components/ComparisonBadge";
import { ExerciseLogPanel } from "../components/ExerciseLogPanel";
import { PrimaryButton } from "../components/PrimaryButton";
import { ProgressRing } from "../components/ProgressRing";
import { ScreenLayout } from "../components/ScreenLayout";
import { WorkoutPickerModal } from "../components/WorkoutPickerModal";
import { borderRadius, colors, gradients, spacing, typography } from "../constants/theme";
import { WEEKLY_WORKOUTS } from "../constants/workouts";
import { ExerciseLog, SetRecord, Workout } from "../types";
import { compareExercise } from "../utils/training";

type Props = {
  workout: Workout;
  defaultWorkout: Workout;
  isWorkoutOverridden: boolean;
  onChangeWorkout: (workoutId: string) => void;
  onResetWorkout: () => void;
  onBack: () => void;
  onOpenHistory: () => void;
  onOpenExerciseHistory: (exerciseId: string, exerciseName: string) => void;
  completedIds: string[];
  onToggleExercise: (exerciseId: string) => void;
  getTodayExerciseLog: (exerciseId: string) => ExerciseLog | undefined;
  getPreviousExerciseLog: (exerciseId: string) => ExerciseLog | undefined;
  onSaveExerciseLog: (
    exerciseId: string,
    exerciseName: string,
    sets: SetRecord[]
  ) => Promise<ExerciseLog | undefined>;
};

export function TrainingScreen({
  workout,
  defaultWorkout,
  isWorkoutOverridden,
  onChangeWorkout,
  onResetWorkout,
  onBack,
  onOpenHistory,
  onOpenExerciseHistory,
  completedIds,
  onToggleExercise,
  getTodayExerciseLog,
  getPreviousExerciseLog,
  onSaveExerciseLog,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    setExpandedId(null);
  }, [workout.id]);

  const exerciseIdSet = new Set(workout.exercises.map((e) => e.id));
  const validCompleted = completedIds.filter((id) => exerciseIdSet.has(id));
  const completedCount = validCompleted.length;
  const total = workout.exercises.length;
  const progress = total > 0 ? Math.min(100, Math.round((completedCount / total) * 100)) : 0;

  const handleToggle = (id: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onToggleExercise(id);
  };

  return (
    <ScreenLayout
      title="Training"
      subtitle={`${workout.emoji} ${workout.title}`}
      onBack={onBack}
    >
      <PrimaryButton label="📊 トレーニング履歴" onPress={onOpenHistory} variant="ghost" />

      <TouchableOpacity style={styles.changeMenuBtn} onPress={() => setPickerVisible(true)}>
        <Text style={styles.changeMenuText}>🔄 メニューを変更</Text>
        {isWorkoutOverridden ? (
          <View style={styles.todayOnlyBadge}>
            <Text style={styles.todayOnlyText}>今日だけ変更中</Text>
          </View>
        ) : null}
      </TouchableOpacity>

      <WorkoutPickerModal
        visible={pickerVisible}
        workouts={WEEKLY_WORKOUTS}
        selectedId={workout.id}
        defaultId={defaultWorkout.id}
        isOverridden={isWorkoutOverridden}
        onSelect={(id) => {
          onChangeWorkout(id);
          setPickerVisible(false);
        }}
        onResetDefault={() => {
          onResetWorkout();
          setPickerVisible(false);
        }}
        onClose={() => setPickerVisible(false)}
      />

      <LinearGradient colors={[...gradients.card]} style={styles.hero}>
        <View style={styles.heroRow}>
          <View style={styles.heroFlex}>
            <Text style={styles.heroLabel}>TODAY'S WORKOUT</Text>
            <Text style={styles.heroTitle}>{workout.title}</Text>
            {isWorkoutOverridden ? (
              <Text style={styles.heroOverride}>
                曜日のデフォルト: {defaultWorkout.emoji} {defaultWorkout.title}
              </Text>
            ) : null}
            <Text style={styles.heroSub}>
              {completedCount} / {total} 種目完了
            </Text>
          </View>
          <ProgressRing progress={progress} size={96} />
        </View>
        <View style={styles.barTrack}>
          <LinearGradient
            colors={[colors.goldDark, colors.gold, colors.goldLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.barFill, { width: `${progress}%` }]}
          />
        </View>
      </LinearGradient>

      <Text style={styles.listLabel}>EXERCISES — タップでセット記録</Text>

      {workout.exercises.map((exercise, index) => {
        const done = validCompleted.includes(exercise.id);
        const expanded = expandedId === exercise.id;
        const todayLog = getTodayExerciseLog(exercise.id);
        const previousLog = getPreviousExerciseLog(exercise.id);
        const comparison = compareExercise(todayLog, previousLog);

        return (
          <View key={exercise.id} style={[styles.row, done && styles.rowDone]}>
            <TouchableOpacity
              style={styles.rowMain}
              onPress={() => setExpandedId(expanded ? null : exercise.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.indexBadge, done && styles.indexBadgeDone]}>
                <Text style={[styles.indexText, done && styles.indexTextDone]}>
                  {done ? "✓" : index + 1}
                </Text>
              </View>
              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text style={[styles.name, done && styles.nameDone]}>{exercise.name}</Text>
                  {todayLog?.isPR ? (
                    <View style={styles.prBadge}>
                      <Text style={styles.prBadgeText}>PR</Text>
                    </View>
                  ) : null}
                </View>
                {exercise.sets ? <Text style={styles.sets}>{exercise.sets}</Text> : null}
                {todayLog?.estimated1RM ? (
                  <ComparisonBadge comparison={comparison} compact />
                ) : todayLog?.sets?.some((s) => s.reps > 0) ? (
                  <Text style={styles.savedLine}>✓ 記録済み</Text>
                ) : previousLog?.estimated1RM ? (
                  <Text style={styles.prevLine}>前回 1RM {previousLog.estimated1RM}kg</Text>
                ) : null}
              </View>
              <Text style={styles.chevron}>{expanded ? "▲" : "▼"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.checkbox, done && styles.checkboxDone]}
              onPress={() => handleToggle(exercise.id)}
              hitSlop={8}
            >
              {done ? <Text style={styles.checkMark}>✓</Text> : null}
            </TouchableOpacity>

            {expanded ? (
              <View style={styles.panelWrap}>
                <ExerciseLogPanel
                  exerciseId={exercise.id}
                  exerciseName={exercise.name}
                  setsLabel={exercise.sets}
                  todayLog={todayLog}
                  previousLog={previousLog}
                  onSave={(sets) => onSaveExerciseLog(exercise.id, exercise.name, sets)}
                />
                {todayLog ? (
                  <TouchableOpacity
                    onPress={() => onOpenExerciseHistory(exercise.id, exercise.name)}
                    style={styles.growthLink}
                  >
                    <Text style={styles.growthLinkText}>📈 種目の成長を見る</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}
          </View>
        );
      })}

      {progress === 100 && total > 0 ? (
        <View style={styles.completeBanner}>
          <Text style={styles.completeEmoji}>🏆</Text>
          <Text style={styles.completeText}>今日のトレーニング完了！お疲れ様でした</Text>
        </View>
      ) : null}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  changeMenuBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  changeMenuText: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: "600",
  },
  todayOnlyBadge: {
    backgroundColor: "rgba(201,169,98,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  todayOnlyText: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: "700",
  },
  hero: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderGold,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  heroFlex: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  heroLabel: {
    ...typography.label,
    color: colors.gold,
    marginBottom: 4,
  },
  heroTitle: {
    ...typography.title,
    color: colors.text,
    fontSize: 22,
  },
  heroSub: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  heroOverride: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  barTrack: {
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.full,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: borderRadius.full,
  },
  listLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  row: {
    backgroundColor: colors.surfaceSolid,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowDone: {
    borderColor: colors.borderGold,
    backgroundColor: "rgba(201,169,98,0.06)",
  },
  rowMain: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingRight: 36,
  },
  indexBadge: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  indexBadgeDone: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  indexText: {
    color: colors.textSecondary,
    fontWeight: "700",
    fontSize: 13,
  },
  indexTextDone: {
    color: colors.background,
  },
  info: { flex: 1 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  name: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "600",
  },
  nameDone: {
    color: colors.textSecondary,
  },
  prBadge: {
    backgroundColor: colors.gold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  prBadgeText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: "800",
  },
  sets: {
    color: colors.gold,
    fontSize: 13,
    marginTop: 3,
    fontWeight: "500",
  },
  prevLine: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
  savedLine: {
    color: colors.success,
    fontSize: 11,
    marginTop: 4,
    fontWeight: "600",
  },
  chevron: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 8,
  },
  checkbox: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    width: 26,
    height: 26,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.borderGold,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  checkMark: {
    color: colors.background,
    fontWeight: "700",
    fontSize: 14,
  },
  panelWrap: {
    marginTop: spacing.sm,
  },
  growthLink: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  growthLinkText: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: "600",
  },
  completeBanner: {
    alignItems: "center",
    padding: spacing.xl,
    marginTop: spacing.md,
    backgroundColor: "rgba(52,211,153,0.08)",
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.25)",
  },
  completeEmoji: { fontSize: 36, marginBottom: spacing.sm },
  completeText: {
    color: colors.success,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
});

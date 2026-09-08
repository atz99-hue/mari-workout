import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScreenLayout, Section } from "../components/ScreenLayout";
import { borderRadius, colors, spacing, typography } from "../constants/theme";
import { getWorkoutById } from "../constants/workouts";
import { SessionExerciseDetail } from "../types";
import { formatDate } from "../utils/date";
import { isFinitePositiveNumber } from "../utils/training";

type SessionSummary = {
  date: string;
  workoutId: string;
  completedCount: number;
  loggedCount: number;
  prCount: number;
};

type Props = {
  onBack: () => void;
  sessions: SessionSummary[];
  onOpenExercise: (exerciseId: string, exerciseName: string) => void;
  getSessionDetails: (date: string, workoutId: string) => SessionExerciseDetail[];
};

function ExerciseHistoryRow({
  exercise,
  onPress,
}: {
  exercise: SessionExerciseDetail;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.exerciseRow} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
        {exercise.isPR ? (
          <View style={styles.prBadge}>
            <Text style={styles.prBadgeText}>PR</Text>
          </View>
        ) : exercise.completed && !exercise.hasLog ? (
          <Text style={styles.checkOnly}>✓ 完了</Text>
        ) : null}
      </View>

      {exercise.hasLog ? (
        <View style={styles.detailBlock}>
          {exercise.setCount > 0 ? (
            <Text style={styles.setMeta}>
              {exercise.setCount}セット — {exercise.setsSummary}
            </Text>
          ) : (
            <Text style={styles.setMeta}>{exercise.setsSummary}</Text>
          )}
          {isFinitePositiveNumber(exercise.estimated1RM) ? (
            <Text style={styles.rmText}>推定1RM {exercise.estimated1RM}kg</Text>
          ) : null}
        </View>
      ) : (
        <Text style={styles.checkMeta}>{exercise.setsSummary}</Text>
      )}

      {exercise.hasLog ? (
        <Text style={styles.exerciseArrow}>成長を見る →</Text>
      ) : null}
    </TouchableOpacity>
  );
}

export function TrainingHistoryScreen({
  onBack,
  sessions,
  onOpenExercise,
  getSessionDetails,
}: Props) {
  return (
    <ScreenLayout title="History" subtitle="トレーニング履歴" onBack={onBack}>
      <Section title="セッション一覧">
        {sessions.length === 0 ? (
          <Text style={styles.empty}>まだ履歴がありません</Text>
        ) : (
          sessions.map((session) => {
            const workout = getWorkoutById(session.workoutId);
            const exercises = getSessionDetails(session.date, session.workoutId);
            return (
              <View key={`${session.date}-${session.workoutId}`} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionDate}>{formatDate(session.date)}</Text>
                  <Text style={styles.sessionWorkout}>
                    {workout ? `${workout.emoji} ${workout.title}` : session.workoutId}
                  </Text>
                  <View style={styles.stats}>
                    <Text style={styles.stat}>完了 {session.completedCount}</Text>
                    <Text style={styles.stat}>記録 {session.loggedCount}</Text>
                    {session.prCount > 0 ? (
                      <Text style={styles.prStat}>PR {session.prCount}</Text>
                    ) : null}
                  </View>
                </View>

                {exercises.length > 0 ? (
                  <View style={styles.exerciseList}>
                    {exercises.map((ex) => (
                      <ExerciseHistoryRow
                        key={ex.exerciseId}
                        exercise={ex}
                        onPress={() => onOpenExercise(ex.exerciseId, ex.exerciseName)}
                      />
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noExercises}>種目記録なし</Text>
                )}
              </View>
            );
          })
        )}
      </Section>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  empty: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  sessionCard: {
    backgroundColor: colors.surfaceSolid,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sessionHeader: {
    marginBottom: spacing.sm,
  },
  sessionDate: {
    ...typography.label,
    color: colors.gold,
  },
  sessionWorkout: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "600",
    marginTop: 4,
  },
  stats: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  stat: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  prStat: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "700",
  },
  exerciseList: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  exerciseRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  exerciseName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
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
  checkOnly: {
    color: colors.success,
    fontSize: 11,
    fontWeight: "600",
  },
  detailBlock: {
    marginTop: spacing.xs,
  },
  setMeta: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  rmText: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  checkMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  exerciseArrow: {
    color: colors.gold,
    fontSize: 12,
    marginTop: spacing.xs,
    textAlign: "right",
  },
  noExercises: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.xs,
  },
});

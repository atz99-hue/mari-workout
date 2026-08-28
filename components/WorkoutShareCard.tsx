import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, gradients, borderRadius, spacing, typography } from "../constants/theme";

type ShareExercise = {
  name: string;
  weightKg: number;
  reps: number;
  estimated1RM?: number;
  isPR?: boolean;
};

type Props = {
  userName: string;
  workoutTitle: string;
  completedCount: number;
  totalCount: number;
  exercises: ShareExercise[];
  date: string;
};

export function WorkoutShareCard({
  userName,
  workoutTitle,
  completedCount,
  totalCount,
  exercises,
  date,
}: Props) {
  const progress =
    totalCount > 0
      ? Math.round((completedCount / totalCount) * 100)
      : 0;

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={[...gradients.hero]}
        style={styles.card}
      >
        <Text style={styles.brand}>MARI FITNESS</Text>

        <Text style={styles.label}>TODAY'S WORKOUT</Text>

        <Text style={styles.title}>{workoutTitle}</Text>

        <Text style={styles.user}>{userName || "MARI FITNESS USER"}</Text>

        <View style={styles.progressBox}>
          <View>
            <Text style={styles.progressNumber}>{progress}%</Text>
            <Text style={styles.progressLabel}>COMPLETED</Text>
          </View>

          <View style={styles.progressRight}>
            <Text style={styles.progressCount}>
              {completedCount} / {totalCount}
            </Text>
            <Text style={styles.progressLabel}>EXERCISES</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {exercises.slice(0, 5).map((exercise, index) => (
          <View key={`${exercise.name}-${index}`} style={styles.exercise}>
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>
                {exercise.name}
              </Text>

              <Text style={styles.exerciseSet}>
                {exercise.weightKg > 0 ? `${exercise.weightKg}kg` : "-"}
                {" × "}
                {exercise.reps > 0 ? exercise.reps : "-"}
              </Text>
            </View>

            {exercise.isPR ? (
              <View style={styles.prBadge}>
                <Text style={styles.prText}>NEW PR</Text>
              </View>
            ) : exercise.estimated1RM ? (
              <Text style={styles.rm}>
                1RM {exercise.estimated1RM}kg
              </Text>
            ) : null}
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerMain}>
            KEEP TRAINING.
          </Text>

          <Text style={styles.footerSub}>
            Powered by MARI FITNESS
          </Text>

          <Text style={styles.date}>{date}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    padding: spacing.lg,
  },

  card: {
    width: 360,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },

  brand: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: spacing.xl,
  },

  label: {
    ...typography.label,
    color: colors.gold,
    marginBottom: spacing.xs,
  },

  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },

  user: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.lg,
  },

  progressBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: "rgba(201,169,98,0.08)",
    borderWidth: 1,
    borderColor: colors.borderGold,
  },

  progressNumber: {
    color: colors.goldLight,
    fontSize: 34,
    fontWeight: "800",
  },

  progressCount: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "right",
  },

  progressLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 2,
  },

  progressRight: {
    alignItems: "flex-end",
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },

  exercise: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },

  exerciseInfo: {
    flex: 1,
  },

  exerciseName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },

  exerciseSet: {
    color: colors.gold,
    fontSize: 13,
    marginTop: 3,
  },

  rm: {
    color: colors.textSecondary,
    fontSize: 11,
    marginLeft: spacing.sm,
  },

  prBadge: {
    backgroundColor: colors.gold,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },

  prText: {
    color: colors.background,
    fontSize: 9,
    fontWeight: "900",
  },

  footer: {
    alignItems: "center",
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  footerMain: {
    color: colors.goldLight,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 2,
  },

  footerSub: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 5,
  },

  date: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: spacing.sm,
  },
});
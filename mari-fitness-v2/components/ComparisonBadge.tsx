import { StyleSheet, Text, View } from "react-native";
import { borderRadius, colors, spacing, typography } from "../constants/theme";
import { ExerciseComparison } from "../types";

type Props = {
  comparison: ExerciseComparison;
  compact?: boolean;
};

export function ComparisonBadge({ comparison, compact }: Props) {
  const isPositive = comparison.isPR || comparison.improved;
  const bg = comparison.isPR
    ? "rgba(201,169,98,0.2)"
    : isPositive
      ? "rgba(52,211,153,0.12)"
      : comparison.hasPrevious && (comparison.delta1RM ?? 0) < 0
        ? "rgba(248,113,113,0.1)"
        : colors.surfaceLight;

  const border = comparison.isPR
    ? colors.gold
    : isPositive
      ? colors.success
      : colors.border;

  const textColor = comparison.isPR ? colors.gold : isPositive ? colors.success : colors.textSecondary;

  return (
    <View style={[styles.wrap, { backgroundColor: bg, borderColor: border }, compact && styles.compact]}>
      <Text style={[styles.message, { color: textColor }, compact && styles.messageCompact]}>
        {comparison.message}
      </Text>
      {!compact && comparison.current1RM ? (
        <Text style={styles.detail}>
          推定1RM {comparison.current1RM}kg
          {comparison.previous1RM ? `（前回 ${comparison.previous1RM}kg）` : ""}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  compact: {
    marginTop: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  message: {
    fontSize: 13,
    fontWeight: "700",
  },
  messageCompact: {
    fontSize: 11,
    fontWeight: "600",
  },
  detail: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
});

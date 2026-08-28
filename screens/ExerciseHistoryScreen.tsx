import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { ScreenLayout, Section } from "../components/ScreenLayout";
import { borderRadius, colors, spacing, typography } from "../constants/theme";
import { OneRMHistoryEntry } from "../types";
import { formatDate } from "../utils/date";

type HistoryEntry = {
  date: string;
  workoutId: string;
  log: {
    estimated1RM?: number;
    isPR?: boolean;
    sets: { setNumber: number; weightKg: number; reps: number; completed: boolean }[];
  };
};

type Props = {
  onBack: () => void;
  exerciseName: string;
  oneRMHistory: OneRMHistoryEntry[];
  detailHistory: HistoryEntry[];
};

function Mini1RMChart({ data }: { data: OneRMHistoryEntry[] }) {
  if (data.length < 2) {
    return (
      <View style={chartStyles.empty}>
        <Text style={chartStyles.emptyText}>2回以上記録するとグラフが表示されます</Text>
      </View>
    );
  }

  const width = 300;
  const height = 120;
  const pad = 16;
  const values = data.map((d) => d.estimated1RM);
  const min = Math.min(...values) * 0.95;
  const max = Math.max(...values) * 1.05;
  const span = max - min || 1;

  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = pad + (height - pad * 2) - ((d.estimated1RM - min) / span) * (height - pad * 2);
    return { x, y, d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <View style={chartStyles.wrap}>
      <Text style={chartStyles.label}>推定1RM 推移</Text>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Path d={linePath} stroke={colors.gold} strokeWidth={2.5} fill="none" />
        {points.map((p) => (
          <Circle
            key={p.d.date}
            cx={p.x}
            cy={p.y}
            r={p.d.isPR ? 5 : 4}
            fill={p.d.isPR ? colors.success : colors.gold}
          />
        ))}
      </Svg>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surfaceSolid,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderGold,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    color: colors.gold,
    marginBottom: spacing.sm,
  },
  empty: {
    padding: spacing.lg,
    alignItems: "center",
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});

export function ExerciseHistoryScreen({
  onBack,
  exerciseName,
  oneRMHistory,
  detailHistory,
}: Props) {
  const best = oneRMHistory.reduce((max, e) => Math.max(max, e.estimated1RM), 0);

  return (
    <ScreenLayout title="Growth" subtitle={exerciseName} onBack={onBack}>
      {best > 0 ? (
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>BEST 1RM</Text>
          <Text style={styles.heroValue}>
            {best}
            <Text style={styles.heroUnit}> kg</Text>
          </Text>
        </View>
      ) : null}

      <Mini1RMChart data={oneRMHistory} />

      <Section title="記録履歴">
        {detailHistory.length === 0 ? (
          <Text style={styles.empty}>記録がありません</Text>
        ) : (
          detailHistory.map(({ date, log, workoutId }) => (
            <View key={`${date}-${workoutId}`} style={styles.row}>
              <View>
                <Text style={styles.date}>{formatDate(date)}</Text>
                {log.isPR ? <Text style={styles.prTag}>🏆 PR</Text> : null}
              </View>
              <View style={styles.right}>
                {log.estimated1RM ? (
                  <Text style={styles.rm}>1RM {log.estimated1RM}kg</Text>
                ) : null}
                <Text style={styles.setsDetail}>
                  {log.sets
                    .filter((s) => s.completed && s.reps > 0)
                    .map((s) => `${s.weightKg}kg×${s.reps}`)
                    .join(" / ") || "—"}
                </Text>
              </View>
            </View>
          ))
        )}
      </Section>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  heroLabel: {
    ...typography.label,
    color: colors.gold,
  },
  heroValue: {
    fontSize: 42,
    fontWeight: "200",
    color: colors.text,
  },
  heroUnit: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  date: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 15,
  },
  prTag: {
    color: colors.gold,
    fontSize: 12,
    marginTop: 4,
    fontWeight: "700",
  },
  right: {
    alignItems: "flex-end",
  },
  rm: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: "700",
  },
  setsDetail: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    textAlign: "right",
  },
});

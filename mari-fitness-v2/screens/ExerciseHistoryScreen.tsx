import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { ComparisonBadge } from "../components/ComparisonBadge";
import { ScreenLayout, Section } from "../components/ScreenLayout";
import { borderRadius, colors, spacing, typography } from "../constants/theme";
import { ExerciseLog, OneRMHistoryEntry } from "../types";
import { formatDate } from "../utils/date";
import { getExerciseGrowthSummary, isFinitePositiveNumber } from "../utils/training";

type HistoryEntry = {
  date: string;
  workoutId: string;
  log: ExerciseLog;
};

type Props = {
  onBack: () => void;
  exerciseName: string;
  oneRMHistory: OneRMHistoryEntry[];
  detailHistory: HistoryEntry[];
};

function Mini1RMChart({ data }: { data: OneRMHistoryEntry[] }) {
  const values = data.map((d) => d.estimated1RM).filter(isFinitePositiveNumber);
  if (values.length < 2) {
    return (
      <View style={chartStyles.empty}>
        <Text style={chartStyles.emptyText}>2回以上記録するとグラフが表示されます</Text>
      </View>
    );
  }

  const width = 300;
  const height = 120;
  const pad = 16;
  const min = Math.min(...values) * 0.95;
  const max = Math.max(...values) * 1.05;
  const span = max - min || 1;

  const points = data
    .filter((d) => isFinitePositiveNumber(d.estimated1RM))
    .map((d, i, arr) => {
      const x = pad + (i / (arr.length - 1)) * (width - pad * 2);
      const y = pad + (height - pad * 2) - ((d.estimated1RM - min) / span) * (height - pad * 2);
      return { x, y, d };
    })
    .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));

  if (points.length < 2) {
    return (
      <View style={chartStyles.empty}>
        <Text style={chartStyles.emptyText}>2回以上記録するとグラフが表示されます</Text>
      </View>
    );
  }

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <View style={chartStyles.wrap}>
      <Text style={chartStyles.label}>推定1RM 推移</Text>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Path d={linePath} stroke={colors.gold} strokeWidth={2.5} fill="none" />
        {points.map((p, i) => (
          <Circle
            key={`${p.d.date}-${i}`}
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

function StatTile({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>
        {value}
        {unit ? <Text style={styles.statUnit}> {unit}</Text> : null}
      </Text>
    </View>
  );
}

function formatSetLine(sets: HistoryEntry["log"]["sets"]): string {
  return (
    sets
      .filter((s) => s.completed && s.reps > 0 && Number.isFinite(s.reps) && Number.isFinite(s.weightKg))
      .map((s) => (s.weightKg > 0 ? `${s.weightKg}kg×${s.reps}` : `${s.reps}回`))
      .join(" / ") || "—"
  );
}

export function ExerciseHistoryScreen({
  onBack,
  exerciseName,
  oneRMHistory,
  detailHistory,
}: Props) {
  const growth = getExerciseGrowthSummary(oneRMHistory, detailHistory);

  return (
    <ScreenLayout title="Growth" subtitle={exerciseName} onBack={onBack}>
      {growth.best1RM ? (
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>BEST 1RM</Text>
          <Text style={styles.heroValue}>
            {growth.best1RM}
            <Text style={styles.heroUnit}> kg</Text>
          </Text>
        </View>
      ) : null}

      <View style={styles.statRow}>
        <StatTile
          label="最高重量"
          value={growth.bestWeightKg != null ? String(growth.bestWeightKg) : "—"}
          unit={growth.bestWeightKg != null ? "kg" : undefined}
        />
        <StatTile
          label="最高回数"
          value={growth.bestReps != null ? String(growth.bestReps) : "—"}
          unit={growth.bestReps != null ? "回" : undefined}
        />
        <StatTile label="PR" value={String(growth.prHistory.length)} unit="回" />
      </View>

      {growth.chartHistory.length > 0 ? (
        <View style={styles.compareWrap}>
          <Text style={styles.compareLabel}>前回との比較</Text>
          <ComparisonBadge comparison={growth.comparison} />
        </View>
      ) : null}

      {growth.chartHistory.length >= 2 ? (
        <Mini1RMChart data={growth.chartHistory} />
      ) : (
        <View style={chartStyles.wrap}>
          <Text style={chartStyles.label}>推定1RM 推移</Text>
          <View style={chartStyles.empty}>
            <Text style={chartStyles.emptyText}>
              {growth.chartHistory.length === 1
                ? "2回以上記録するとグラフが表示されます"
                : "重量ありの記録があると推定1RM推移が表示されます"}
            </Text>
          </View>
        </View>
      )}

      <Section title="PR更新履歴">
        {growth.prHistory.length === 0 ? (
          <Text style={styles.empty}>まだPRはありません。初回記録はPRになりません。</Text>
        ) : (
          growth.prHistory.map((entry, index) => (
            <View key={`pr-${entry.date}-${index}`} style={styles.prRow}>
              <View>
                <Text style={styles.date}>{formatDate(entry.date)}</Text>
                <Text style={styles.prTag}>🏆 PR</Text>
              </View>
              <Text style={styles.rm}>1RM {entry.estimated1RM}kg</Text>
            </View>
          ))
        )}
      </Section>

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
                {isFinitePositiveNumber(log.estimated1RM) ? (
                  <Text style={styles.rm}>1RM {log.estimated1RM}kg</Text>
                ) : null}
                <Text style={styles.setsDetail}>{formatSetLine(log.sets)}</Text>
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
  statRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statTile: {
    flex: 1,
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1,
    borderColor: colors.borderGold,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  statLabel: {
    ...typography.label,
    color: colors.gold,
    marginBottom: 4,
  },
  statValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
  },
  statUnit: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
  compareWrap: {
    marginBottom: spacing.md,
  },
  compareLabel: {
    ...typography.label,
    color: colors.gold,
    marginBottom: spacing.xs,
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
  prRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1,
    borderColor: colors.borderGold,
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
    flex: 1,
    marginLeft: spacing.sm,
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

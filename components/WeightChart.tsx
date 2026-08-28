import Svg, { Circle, Defs, LinearGradient as SvgGradient, Path, Stop, Text as SvgText } from "react-native-svg";
import { StyleSheet, Text, View } from "react-native";
import { borderRadius, colors, spacing, typography } from "../constants/theme";
import { WeightEntry } from "../types";
import { formatDate } from "../utils/date";

type Props = {
  entries: WeightEntry[];
  targetWeight?: number;
  height?: number;
};

export function WeightChart({ entries, targetWeight, height = 200 }: Props) {
  const sorted = [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14);

  if (sorted.length < 2) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>2件以上記録するとグラフが表示されます</Text>
      </View>
    );
  }

  const width = 320;
  const padX = 24;
  const padY = 24;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const weights = sorted.map((e) => e.weight);
  let min = Math.min(...weights);
  let max = Math.max(...weights);
  if (targetWeight !== undefined) {
    min = Math.min(min, targetWeight);
    max = Math.max(max, targetWeight);
  }
  const range = max - min || 1;
  min -= range * 0.1;
  max += range * 0.1;
  const span = max - min;

  const points = sorted.map((entry, i) => {
    const x = padX + (i / (sorted.length - 1)) * chartW;
    const y = padY + chartH - ((entry.weight - min) / span) * chartH;
    return { x, y, entry };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padY + chartH} L ${points[0].x} ${padY + chartH} Z`;

  const targetY =
    targetWeight !== undefined ? padY + chartH - ((targetWeight - min) / span) * chartH : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>体重推移</Text>
        <Text style={styles.range}>
          {sorted[0].weight} → {sorted[sorted.length - 1].weight} kg
        </Text>
      </View>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <SvgGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={colors.goldDark} />
            <Stop offset="1" stopColor={colors.goldLight} />
          </SvgGradient>
          <SvgGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="rgba(201,169,98,0.25)" />
            <Stop offset="1" stopColor="rgba(201,169,98,0)" />
          </SvgGradient>
        </Defs>

        {[0, 0.5, 1].map((t) => {
          const y = padY + chartH * t;
          return (
            <Path
              key={t}
              d={`M ${padX} ${y} L ${padX + chartW} ${y}`}
              stroke={colors.border}
              strokeWidth={1}
              strokeDasharray="4 6"
            />
          );
        })}

        {targetY !== null ? (
          <>
            <Path
              d={`M ${padX} ${targetY} L ${padX + chartW} ${targetY}`}
              stroke={colors.success}
              strokeWidth={1.5}
              strokeDasharray="6 4"
              opacity={0.7}
            />
            <SvgText x={padX + 4} y={targetY - 6} fill={colors.success} fontSize={10}>
              目標 {targetWeight}kg
            </SvgText>
          </>
        ) : null}

        <Path d={areaPath} fill="url(#areaGrad)" />
        <Path d={linePath} stroke="url(#lineGrad)" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p) => (
          <Circle key={p.entry.id} cx={p.x} cy={p.y} r={4} fill={colors.gold} stroke={colors.background} strokeWidth={2} />
        ))}
      </Svg>
      <View style={styles.labels}>
        <Text style={styles.dateLabel}>{formatDate(sorted[0].date)}</Text>
        <Text style={styles.dateLabel}>{formatDate(sorted[sorted.length - 1].date)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceSolid,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderGold,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  title: {
    ...typography.label,
    color: colors.gold,
  },
  range: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
  },
  dateLabel: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  empty: {
    backgroundColor: colors.surfaceSolid,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
});

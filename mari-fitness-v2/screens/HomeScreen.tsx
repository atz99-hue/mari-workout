import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GradientBackground } from "../components/GradientBackground";
import { HomeBottomNav } from "../components/HomeBottomNav";
import { MariAvatar } from "../components/MariAvatar";
import { MariFitnessLogo } from "../components/MariFitnessLogo";
import { PremiumCard } from "../components/PremiumCard";
import { ProgressRing } from "../components/ProgressRing";
import { UserAvatar } from "../components/UserAvatar";
import { borderRadius, colors, gradients, shadows, spacing, typography } from "../constants/theme";
import { todayKey } from "../storage";
import { AppSettings, MealEntry, ScreenName, WeightEntry, Workout } from "../types";

type Props = {
  onNavigate: (screen: ScreenName) => void;
  onStartTraining?: () => void;
  latestWeight?: WeightEntry;
  todayMeals: MealEntry[];
  settings: AppSettings;
  trainingProgress: number;
  todayWorkout: Workout;
  isWorkoutOverridden?: boolean;
};

type MetricRow = {
  label: string;
  progress: number;
  icon: string;
};

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function formatWeight(value?: number): string {
  if (value === undefined || value <= 0) return "—";
  return `${value.toFixed(1)} kg`;
}

function MetricItem({ label, progress, icon }: MetricRow) {
  const pct = clampPercent(progress);
  return (
    <View style={styles.metricItem}>
      <View style={styles.metricTop}>
        <Text style={styles.metricIcon}>{icon}</Text>
        <Text style={styles.metricPct}>{pct}%</Text>
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricTrack}>
        <View style={[styles.metricFill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

function SummaryTile({
  label,
  value,
  unit,
  onPress,
}: {
  label: string;
  value: string;
  unit?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.summaryTile} onPress={onPress} activeOpacity={0.75}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
      {unit ? <Text style={styles.summaryUnit}>{unit}</Text> : null}
    </TouchableOpacity>
  );
}

export function HomeScreen({
  onNavigate,
  onStartTraining,
  latestWeight,
  todayMeals,
  settings,
  trainingProgress,
  todayWorkout: workout,
  isWorkoutOverridden,
}: Props) {
  const today = todayKey();
  const todayCalories = todayMeals.reduce((sum, m) => sum + (m.calories ?? 0), 0);
  const todayProtein = todayMeals.reduce((sum, m) => sum + (m.protein ?? 0), 0);

  const calProgress = clampPercent((todayCalories / settings.dailyCalorieGoal) * 100);
  const proteinProgress = clampPercent((todayProtein / settings.dailyProteinGoal) * 100);
  const weightLoggedToday = latestWeight?.date === today;
  const weightProgress = weightLoggedToday ? 100 : 0;
  const trainingPct = clampPercent(trainingProgress);

  const overallProgress = clampPercent(
    (trainingPct + calProgress + proteinProgress + weightProgress) / 4
  );

  const weightDisplay = latestWeight?.weight ? `${latestWeight.weight.toFixed(1)}` : "—";
  const weightUnit = latestWeight?.weight ? "kg" : undefined;

  const metrics: MetricRow[] = [
    { label: "トレーニング", progress: trainingPct, icon: "💪" },
    { label: "食事", progress: calProgress, icon: "🍽" },
    { label: "タンパク質", progress: proteinProgress, icon: "🥩" },
    { label: "体重", progress: weightProgress, icon: "⚖" },
  ];

  return (
    <GradientBackground variant="hero">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header */}
        <View style={styles.header}>
          <MariFitnessLogo />
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7}>
              <Text style={styles.headerBtnIcon}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => onNavigate("settings")}
              activeOpacity={0.7}
            >
              <Text style={styles.headerBtnIcon}>⚙</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Welcome */}
        <View style={styles.welcomeCard}>
          <LinearGradient
            colors={["rgba(107,92,231,0.18)", "rgba(18,18,26,0.95)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.welcomeGradient}
          >
            <View style={styles.welcomeTextCol}>
              <Text style={styles.welcomeLabel}>WELCOME BACK</Text>
              <Text style={styles.welcomeName}>{settings.userName}</Text>
              <Text style={styles.welcomeMessage}>今日も理想の身体へ。</Text>
            </View>
            <View style={styles.avatarRow}>
              <View style={styles.avatarSlot}>
                <UserAvatar name={settings.userName} gender={settings.userGender} size={52} />
                <Text style={styles.avatarCaption}>YOU</Text>
              </View>
              <View style={styles.avatarSlot}>
                <MariAvatar size={52} />
                <Text style={[styles.avatarCaption, styles.avatarCaptionMari]}>MARI</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* 3. 今日の達成度 */}
        <View style={styles.achievementCard}>
          <LinearGradient
            colors={[...gradients.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.achievementGradient}
          >
            <View style={styles.achievementHeader}>
              <View>
                <Text style={styles.achievementBrand}>MARI FITNESS</Text>
                <Text style={styles.achievementTitle}>今日の達成度</Text>
              </View>
              <ProgressRing progress={overallProgress} size={96} label="TOTAL" />
            </View>

            <Text style={styles.overallValue}>{overallProgress}%</Text>

            <View style={styles.metricsGrid}>
              {metrics.map((m) => (
                <MetricItem key={m.label} {...m} />
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* 4. サマリー */}
        <View style={styles.summaryRow}>
          <SummaryTile
            label="体重"
            value={weightDisplay}
            unit={weightUnit}
            onPress={() => onNavigate("weight")}
          />
          <View style={styles.summaryDivider} />
          <SummaryTile
            label="摂取カロリー"
            value={todayCalories > 0 ? todayCalories.toLocaleString() : "—"}
            unit={todayCalories > 0 ? "kcal" : undefined}
            onPress={() => onNavigate("meal")}
          />
          <View style={styles.summaryDivider} />
          <SummaryTile
            label="タンパク質"
            value={todayProtein > 0 ? String(todayProtein) : "—"}
            unit={todayProtein > 0 ? "g" : undefined}
            onPress={() => onNavigate("meal")}
          />
        </View>

        {/* 5. MENU */}
        <Text style={styles.menuLabel}>MENU</Text>

        <PremiumCard
          icon={workout.emoji}
          title="今日のトレーニング"
          subtitle={
            isWorkoutOverridden ? `${workout.title}（今日だけ変更）` : workout.title
          }
          value={`${trainingPct}%`}
          onPress={() => (onStartTraining ? onStartTraining() : onNavigate("training"))}
          accent
          showArrow
        />

        <PremiumCard
          icon="⚖"
          title="体重管理"
          subtitle={
            latestWeight
              ? `最新 ${formatWeight(latestWeight.weight)}`
              : "今日の体重を記録しましょう"
          }
          value={weightLoggedToday ? "記録済" : undefined}
          onPress={() => onNavigate("weight")}
          showArrow
        />

        <PremiumCard
          icon="🍽"
          title="食事管理"
          subtitle={`目標 ${settings.dailyCalorieGoal.toLocaleString()} kcal / ${settings.dailyProteinGoal}g`}
          value={`${calProgress}%`}
          onPress={() => onNavigate("meal")}
          showArrow
        />

        <PremiumCard
          icon="📈"
          title="進捗・履歴"
          subtitle="トレーニングセッションと記録を確認"
          value={trainingPct > 0 ? `${trainingPct}%` : undefined}
          onPress={() => onNavigate("trainingHistory")}
          showArrow
        />

        <PremiumCard
          icon="🏆"
          title="実績・自己ベスト"
          subtitle="PR記録と種目ごとの成長"
          onPress={() => onNavigate("trainingHistory")}
          accent
          showArrow
        />

        <PremiumCard
          icon="✦"
          title="AIマリに相談"
          subtitle="パーソナルフィットネスコーチ"
          onPress={() => onNavigate("chat")}
          accent
          showArrow
        />
      </ScrollView>

      {/* 6. Bottom Nav */}
      <HomeBottomNav active="home" onNavigate={onNavigate} />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: 52,
    paddingBottom: spacing.md,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  headerActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBtnIcon: {
    fontSize: 18,
  },

  /* Welcome */
  welcomeCard: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(107,92,231,0.25)",
    ...shadows.card,
  },
  welcomeGradient: {
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  welcomeTextCol: {
    flex: 1,
    paddingRight: spacing.md,
  },
  welcomeLabel: {
    ...typography.label,
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  welcomeName: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  welcomeMessage: {
    ...typography.subtitle,
    color: colors.textMuted,
    lineHeight: 22,
  },
  avatarRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-end",
  },
  avatarSlot: {
    alignItems: "center",
    gap: spacing.xs,
  },
  avatarCaption: {
    ...typography.caption,
    color: colors.accent,
    letterSpacing: 1.2,
    fontSize: 9,
  },
  avatarCaptionMari: {
    color: colors.gold,
  },

  /* Achievement */
  achievementCard: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderGold,
    ...shadows.card,
  },
  achievementGradient: {
    padding: spacing.lg,
  },
  achievementHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  achievementBrand: {
    ...typography.label,
    color: colors.gold,
    marginBottom: 4,
  },
  achievementTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.3,
  },
  overallValue: {
    fontSize: 42,
    fontWeight: "800",
    color: colors.gold,
    letterSpacing: -0.5,
    marginBottom: spacing.lg,
    lineHeight: 48,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  metricItem: {
    width: "48%",
    backgroundColor: "rgba(0,0,0,0.22)",
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  metricIcon: {
    fontSize: 16,
  },
  metricPct: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: "700",
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  metricTrack: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  metricFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 2,
  },

  /* Summary */
  summaryRow: {
    flexDirection: "row",
    backgroundColor: colors.surfaceSolid,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  summaryTile: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.xs,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    letterSpacing: 0.6,
  },
  summaryValue: {
    color: colors.gold,
    fontSize: 22,
    fontWeight: "700",
  },
  summaryUnit: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },

  menuLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    letterSpacing: 2,
  },
});

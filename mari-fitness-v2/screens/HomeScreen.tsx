import { LinearGradient } from "expo-linear-gradient";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GradientBackground } from "../components/GradientBackground";
import { HomeBottomNav } from "../components/HomeBottomNav";
import { MariFitnessLogo } from "../components/MariFitnessLogo";
import { PremiumCard } from "../components/PremiumCard";
import { ProgressRing } from "../components/ProgressRing";
import { borderRadius, colors, gradients, shadows, spacing, typography } from "../constants/theme";
import { todayKey } from "../storage";
import { AppSettings, MealEntry, ScreenName, WeightEntry, Workout } from "../types";

/** WELCOME BACK 専用。avatars/ の mari_trainer・male_user・female_user は使わない */
const WELCOME_MARI = require("../assets/home/welcome_mari.png");
const WELCOME_USER = require("../assets/home/welcome_user_male.png");
const WELCOME_MARI_AVATAR = require("../assets/home/welcome_mari_avatar.png");

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

        {/* 2. Welcome — Canonical: assets/reference/welcome_back_canonical.png */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeHero}>
            <View style={styles.welcomePurpleGlow} pointerEvents="none" />

            <Image
              source={WELCOME_MARI}
              style={styles.welcomeMari}
              resizeMode="cover"
              accessibilityLabel="小虎のマリトレーナー"
            />
            <Image
              source={WELCOME_USER}
              style={styles.welcomeUser}
              resizeMode="cover"
              accessibilityLabel="ユーザー"
            />

            <View style={styles.welcomeSpeech} pointerEvents="none">
              <Text style={styles.welcomeSpeechText}>
                今日もいい{"\n"}スタートだね！{"\n"}この調子でいこう！
              </Text>
            </View>

            <View style={styles.welcomeCopy} pointerEvents="none">
              <Text style={styles.welcomeLabel}>WELCOME BACK</Text>
              <Text style={styles.welcomeName}>{settings.userName}</Text>
              <Text style={styles.welcomeMessage}>今日も理想の身体へ。</Text>
              <View style={styles.welcomeCallout}>
                <Image
                  source={WELCOME_MARI_AVATAR}
                  style={styles.welcomeCalloutAvatar}
                  resizeMode="cover"
                  accessibilityLabel="小虎マリ"
                />
                <View style={styles.welcomeCalloutBubble}>
                  <Text style={styles.welcomeCalloutText}>
                    小虎のマリトレーナーと一緒に頑張ろう！
                  </Text>
                </View>
              </View>
            </View>
          </View>
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

  /* Welcome — canonical welcome_back_canonical.png */
  welcomeCard: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    marginHorizontal: -spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: "#05050C",
  },
  welcomeHero: {
    height: 318,
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#05050C",
  },
  welcomePurpleGlow: {
    position: "absolute",
    top: 36,
    left: "22%",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(120, 60, 200, 0.28)",
  },
  welcomeMari: {
    position: "absolute",
    left: -6,
    bottom: 0,
    width: "42%",
    height: "100%",
    zIndex: 2,
  },
  welcomeUser: {
    position: "absolute",
    right: -10,
    bottom: 0,
    width: "40%",
    height: "100%",
    zIndex: 2,
  },
  welcomeCopy: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 36,
    alignItems: "center",
    zIndex: 3,
    paddingHorizontal: 92,
  },
  welcomeLabel: {
    ...typography.label,
    color: colors.gold,
    letterSpacing: 2.4,
    fontSize: 12,
    marginBottom: 8,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.85)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  welcomeName: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.4,
    marginBottom: 8,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  welcomeMessage: {
    fontSize: 13,
    fontWeight: "400",
    color: "#FFFFFF",
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 12,
    textShadowColor: "rgba(0,0,0,0.85)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  welcomeSpeech: {
    position: "absolute",
    left: 8,
    bottom: 28,
    zIndex: 4,
    backgroundColor: "rgba(28, 10, 52, 0.94)",
    borderWidth: 1,
    borderColor: "rgba(168, 90, 255, 0.8)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    maxWidth: 128,
  },
  welcomeSpeechText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 16,
  },
  welcomeCallout: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 220,
  },
  welcomeCalloutAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: "rgba(186, 120, 255, 0.95)",
    backgroundColor: "#1A1030",
    zIndex: 1,
  },
  welcomeCalloutBubble: {
    marginLeft: -8,
    paddingLeft: 16,
    paddingRight: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(42, 18, 72, 0.94)",
    borderWidth: 1,
    borderColor: "rgba(168, 90, 255, 0.75)",
    borderRadius: 16,
    maxWidth: 186,
  },
  welcomeCalloutText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
    lineHeight: 14,
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

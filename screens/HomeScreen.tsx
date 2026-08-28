import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GradientBackground } from "../components/GradientBackground";
import { PremiumCard } from "../components/PremiumCard";
import { UserAvatar } from "../components/UserAvatar";
import { MariAvatar } from "../components/MariAvatar";
import { ProgressRing } from "../components/ProgressRing";
import { borderRadius, colors, gradients, spacing, typography } from "../constants/theme";
import { AppSettings, MealEntry, ScreenName, WeightEntry, Workout } from "../types";

type Props = {
  onNavigate: (screen: ScreenName) => void;
  latestWeight?: WeightEntry;
  todayMeals: MealEntry[];
  settings: AppSettings;
  trainingProgress: number;
  todayWorkout: Workout;
  isWorkoutOverridden?: boolean;
};

export function HomeScreen({
  onNavigate,
  latestWeight,
  todayMeals,
  settings,
  trainingProgress,
  todayWorkout: workout,
  isWorkoutOverridden,
}: Props) {
  const todayCalories = todayMeals.reduce((sum, m) => sum + (m.calories ?? 0), 0);
  const todayProtein = todayMeals.reduce((sum, m) => sum + (m.protein ?? 0), 0);
  const calProgress = Math.min(100, Math.round((todayCalories / settings.dailyCalorieGoal) * 100));

  return (
    <GradientBackground variant="hero">
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.identity}>
            <UserAvatar gender={settings.avatarGender} size={48} style={styles.userAvatar} />
            <View>
            <Text style={styles.greeting}>Welcome back</Text>
              <Text style={styles.userName}>{settings.userName}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => onNavigate("settings")}>
            <Text style={styles.settingsIcon}>⚙</Text>
          </TouchableOpacity>
        </View>

        <LinearGradient colors={[...gradients.accent]} style={styles.heroCard}>
          <View style={styles.heroContent}>
            <View style={styles.heroText}>
              <Text style={styles.heroLabel}>MARIFITNESS</Text>
              <Text style={styles.heroTitle}>マリフィットネス</Text>
              <Text style={styles.heroSub}>AIがあなたの理想の体づくりをサポート</Text>
            </View>
            <ProgressRing progress={trainingProgress} label="今日" />
          </View>
        </LinearGradient>

        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statBox}
            onPress={() => onNavigate("weight")}
            activeOpacity={0.7}
          >
            <Text style={styles.statValue}>{latestWeight?.weight ?? "—"}</Text>
            <Text style={styles.statUnit}>{latestWeight ? "kg" : ""}</Text>
            <Text style={styles.statLabel}>体重</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity
            style={styles.statBox}
            onPress={() => onNavigate("meal")}
            activeOpacity={0.7}
          >
            <Text style={styles.statValue}>{todayCalories}</Text>
            <Text style={styles.statUnit}>kcal</Text>
            <Text style={styles.statLabel}>摂取</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity
            style={styles.statBox}
            onPress={() => onNavigate("meal")}
            activeOpacity={0.7}
          >
            <Text style={styles.statValue}>{todayProtein}</Text>
            <Text style={styles.statUnit}>g</Text>
            <Text style={styles.statLabel}>タンパク質</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>MENU</Text>

        <PremiumCard
          icon={workout.emoji}
          title="今日のトレーニング"
          subtitle={
            isWorkoutOverridden ? `${workout.title}（今日だけ変更）` : workout.title
          }
          value={`${trainingProgress}%`}
          onPress={() => onNavigate("training")}
          accent
        />

        <PremiumCard
          icon="⚖️"
          title="体重管理"
          subtitle={latestWeight ? "推移グラフで確認" : "今日の体重を記録"}
          value={latestWeight ? `${latestWeight.weight}` : undefined}
          onPress={() => onNavigate("weight")}
        />

        <PremiumCard
          icon="🍽"
          title="食事管理"
          subtitle={`目標 ${settings.dailyCalorieGoal} kcal`}
          value={`${calProgress}%`}
          onPress={() => onNavigate("meal")}
        />

<View style={styles.mariSection}>
  <MariAvatar size={120} />

  <PremiumCard
    icon="✦"
    title="AIマリに相談"
    subtitle="パーソナルフィットネスコーチ"
    onPress={() => onNavigate("chat")}
    accent
  />
</View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: 56,
    paddingBottom: spacing.xxl,
  },
  mariSection: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  userAvatar: {
    borderWidth: 2,
    borderColor: colors.borderGold,
  },
  greeting: {
    ...typography.label,
    color: colors.gold,
    marginBottom: 4,
  },
  userName: {
    ...typography.hero,
    color: colors.text,
    fontSize: 28,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1,
    borderColor: colors.borderGold,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsIcon: {
    fontSize: 20,
    color: colors.gold,
  },
  heroCard: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderGold,
    marginBottom: spacing.lg,
    overflow: "hidden",
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.xl,
  },
  heroText: { flex: 1, paddingRight: spacing.md },
  heroLabel: {
    ...typography.label,
    color: colors.gold,
    marginBottom: spacing.xs,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  heroSub: {
    ...typography.subtitle,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: colors.surfaceSolid,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    marginBottom: spacing.xl,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    color: colors.gold,
    fontSize: 24,
    fontWeight: "700",
  },
  statUnit: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 6,
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
});

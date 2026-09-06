import { LinearGradient } from "expo-linear-gradient";
import { Image, ImageSourcePropType, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { GradientBackground } from "../components/GradientBackground";
import { HomeBottomNav } from "../components/HomeBottomNav";
import { HomeHero } from "../components/HomeHero";
import {
  BellIcon,
  BicepIcon,
  DumbbellIcon,
  FlameIcon,
  GearIcon,
  PlateIcon,
  ScaleIcon,
  SteakIcon,
  TrophyMiniIcon,
} from "../components/HomeIcons";
import { todayKey } from "../storage";
import { AppSettings, MealEntry, ScreenName, WeightEntry, Workout } from "../types";

const WELCOME_LOGO_M = require("../assets/home/welcome_logo_m.png");
const ICON_CHECK = require("../assets/home/icon_check_gold.png");
const ICON_MENU_TRAINING = require("../assets/home/icon_menu_training.png");
const ICON_MENU_WEIGHT = require("../assets/home/icon_menu_weight.png");
const ICON_MENU_MEAL = require("../assets/home/icon_menu_meal.png");
const ICON_MENU_HISTORY = require("../assets/home/icon_menu_history.png");
const ICON_MENU_PR = require("../assets/home/icon_menu_pr.png");
const ICON_MENU_CHAT = require("../assets/home/icon_menu_chat.png");

const GOLD = "#E8C36A";

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

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function formatWeight(value?: number): string {
  if (value === undefined || value <= 0) return "—";
  return `${value.toFixed(1)} kg`;
}

function HomeProgressRing({ progress, size = 108 }: { progress: number; size?: number }) {
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, progress));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={GOLD}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={styles.ringPercent}>{clamped}%</Text>
        <Text style={styles.ringLabel}>今日</Text>
      </View>
    </View>
  );
}

function MetricValue({ value, unit }: { value: string; unit?: string }) {
  return (
    <Text style={styles.metricValue} numberOfLines={1}>
      {value}
      {unit ? <Text style={styles.metricUnit}> {unit}</Text> : null}
    </Text>
  );
}

function HomeMenuRow({
  icon,
  title,
  subtitle,
  value,
  onPress,
}: {
  icon: ImageSourcePropType;
  title: string;
  subtitle: string;
  value?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.75}>
      <Image source={icon} style={styles.menuIcon} resizeMode="contain" />
      <View style={styles.menuText}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      {value ? <Text style={styles.menuValue}>{value}</Text> : null}
      <Text style={styles.menuChevron}>›</Text>
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
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, 54);
  const bottomInset = Math.max(insets.bottom, 12);

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

  const weightDisplay = latestWeight?.weight ? latestWeight.weight.toFixed(1) : "—";
  const calorieDisplay = todayCalories > 0 ? todayCalories.toLocaleString() : "—";
  const proteinDisplay = todayProtein > 0 ? String(todayProtein) : "—";

  return (
    <GradientBackground variant="hero">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: 28 + bottomInset }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headerBlock, { paddingTop: topInset }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerSide}>
              <TouchableOpacity
                style={styles.headerBtnBlue}
                onPress={() => onNavigate("settings")}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <GearIcon size={16} color="#E0E7FF" />
              </TouchableOpacity>
            </View>
            <View style={styles.headerLogo} pointerEvents="none">
              <Image source={WELCOME_LOGO_M} style={styles.headerMark} resizeMode="contain" />
              <Text style={styles.headerBrand}>MARI FITNESS</Text>
            </View>
            <View style={[styles.headerSide, styles.headerSideRight]}>
              <TouchableOpacity style={styles.headerBtnGold} activeOpacity={0.7}>
                <BellIcon size={14} color={GOLD} />
                <View style={styles.headerDot} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerBtnGold}
                onPress={() => onNavigate("settings")}
                activeOpacity={0.7}
              >
                <GearIcon size={14} color={GOLD} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <HomeHero key="home-hero-v5" userName={settings.userName} userGender={settings.userGender} />

        <View style={styles.achievementCard}>
          <LinearGradient
            colors={["#161022", "#0B0A12"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.achievementInner}
          >
            <View style={styles.achievementColLeft}>
              <Text style={styles.achievementBrand} numberOfLines={1}>
                MARIFITNESS
              </Text>
              <Text style={styles.achievementTitle} numberOfLines={1}>
                今日の達成度
              </Text>
              <Text style={styles.overallValue} numberOfLines={1}>
                {overallProgress}%
              </Text>
              {overallProgress >= 100 ? (
                <View style={styles.achieveBadge}>
                  <TrophyMiniIcon size={10} color={GOLD} />
                  <Text style={styles.achieveBadgeText}>すべての目標を達成しました！</Text>
                </View>
              ) : null}
            </View>

            <HomeProgressRing progress={overallProgress} size={82} />

            <View style={styles.achieveDivider} />

            <View style={styles.achievementColRight}>
              <View style={styles.achieveRow}>
                <View style={[styles.achieveIconWrap, { backgroundColor: "rgba(139,92,246,0.28)" }]}>
                  <DumbbellIcon size={12} color="#C4B5FD" />
                </View>
                <Text style={styles.achieveRowLabel} numberOfLines={1}>
                  トレーニング
                </Text>
                <MetricValue value={`${trainingPct}`} unit="%" />
                {trainingPct >= 100 ? <Image source={ICON_CHECK} style={styles.achieveCheck} /> : null}
              </View>
              <View style={styles.achieveRow}>
                <View style={[styles.achieveIconWrap, { backgroundColor: "rgba(74,222,128,0.2)" }]}>
                  <PlateIcon size={12} color="#86EFAC" />
                </View>
                <Text style={styles.achieveRowLabel} numberOfLines={1}>
                  食事（カロリー）
                </Text>
                <MetricValue
                  value={
                    todayCalories > 0
                      ? `${todayCalories.toLocaleString()} / ${settings.dailyCalorieGoal.toLocaleString()}`
                      : "—"
                  }
                  unit={todayCalories > 0 ? "kcal" : undefined}
                />
                {calProgress >= 100 ? <Image source={ICON_CHECK} style={styles.achieveCheck} /> : null}
              </View>
              <View style={styles.achieveRow}>
                <View style={[styles.achieveIconWrap, { backgroundColor: "rgba(244,114,182,0.22)" }]}>
                  <SteakIcon size={12} color="#F9A8D4" />
                </View>
                <Text style={styles.achieveRowLabel} numberOfLines={1}>
                  タンパク質
                </Text>
                <MetricValue
                  value={todayProtein > 0 ? `${todayProtein} / ${settings.dailyProteinGoal}` : "—"}
                  unit={todayProtein > 0 ? "g" : undefined}
                />
                {proteinProgress >= 100 ? <Image source={ICON_CHECK} style={styles.achieveCheck} /> : null}
              </View>
              <View style={[styles.achieveRow, styles.achieveRowLast]}>
                <View style={[styles.achieveIconWrap, { backgroundColor: "rgba(96,165,250,0.22)" }]}>
                  <ScaleIcon size={12} color="#93C5FD" />
                </View>
                <Text style={styles.achieveRowLabel} numberOfLines={1}>
                  体重記録
                </Text>
                <MetricValue
                  value={latestWeight?.weight ? latestWeight.weight.toFixed(1) : "—"}
                  unit={latestWeight?.weight ? "kg" : undefined}
                />
                {weightLoggedToday ? <Image source={ICON_CHECK} style={styles.achieveCheck} /> : null}
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.summaryRow}>
          <TouchableOpacity
            style={styles.summaryTile}
            onPress={() => onNavigate("weight")}
            activeOpacity={0.75}
          >
            <View style={[styles.summaryIconWrap, { backgroundColor: "rgba(96,165,250,0.22)" }]}>
              <ScaleIcon size={16} color="#60A5FA" />
            </View>
            <Text style={styles.summaryValue}>
              {weightDisplay}
              {latestWeight?.weight ? <Text style={styles.summaryUnit}> kg</Text> : null}
            </Text>
            <Text style={styles.summaryLabel}>体重</Text>
          </TouchableOpacity>
          <View style={styles.summaryDivider} />
          <TouchableOpacity
            style={styles.summaryTile}
            onPress={() => onNavigate("meal")}
            activeOpacity={0.75}
          >
            <View style={[styles.summaryIconWrap, { backgroundColor: "rgba(251,146,60,0.22)" }]}>
              <FlameIcon size={16} color="#FB923C" />
            </View>
            <Text style={styles.summaryValue}>
              {calorieDisplay}
              {todayCalories > 0 ? <Text style={styles.summaryUnit}> kcal</Text> : null}
            </Text>
            <Text style={styles.summaryLabel}>摂取カロリー</Text>
          </TouchableOpacity>
          <View style={styles.summaryDivider} />
          <TouchableOpacity
            style={styles.summaryTile}
            onPress={() => onNavigate("meal")}
            activeOpacity={0.75}
          >
            <View style={[styles.summaryIconWrap, { backgroundColor: "rgba(249,168,212,0.22)" }]}>
              <BicepIcon size={16} color="#F9A8D4" />
            </View>
            <Text style={styles.summaryValue}>
              {proteinDisplay}
              {todayProtein > 0 ? <Text style={styles.summaryUnit}> g</Text> : null}
            </Text>
            <Text style={styles.summaryLabel}>タンパク質</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.menuLabel}>MENU</Text>

        <HomeMenuRow
          icon={ICON_MENU_TRAINING}
          title="今日のトレーニング"
          subtitle={
            isWorkoutOverridden ? `${workout.title}（今日だけ変更）` : workout.title
          }
          value={`${trainingPct}%`}
          onPress={() => (onStartTraining ? onStartTraining() : onNavigate("training"))}
        />
        <HomeMenuRow
          icon={ICON_MENU_WEIGHT}
          title="体重管理"
          subtitle="推移グラフで確認"
          value={latestWeight ? formatWeight(latestWeight.weight) : undefined}
          onPress={() => onNavigate("weight")}
        />
        <HomeMenuRow
          icon={ICON_MENU_MEAL}
          title="食事管理"
          subtitle={`目標 ${settings.dailyCalorieGoal.toLocaleString()} kcal / ${settings.dailyProteinGoal}g`}
          value={`${calProgress}%`}
          onPress={() => onNavigate("meal")}
        />
        <HomeMenuRow
          icon={ICON_MENU_HISTORY}
          title="進捗・履歴"
          subtitle="データの推移と記録を確認"
          onPress={() => onNavigate("trainingHistory")}
        />
        <HomeMenuRow
          icon={ICON_MENU_PR}
          title="実績・自己ベスト"
          subtitle="記録と連続日数を確認"
          onPress={() => onNavigate("trainingHistory")}
        />
        <HomeMenuRow
          icon={ICON_MENU_CHAT}
          title="AIマリに相談"
          subtitle="マリトレーナーとのチャット"
          onPress={() => onNavigate("chat")}
        />
      </ScrollView>

      <HomeBottomNav active="home" onNavigate={onNavigate} bottomInset={bottomInset} />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 14,
    paddingTop: 0,
  },
  headerBlock: {
    marginHorizontal: -14,
    backgroundColor: "#000000",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 44,
  },
  headerSide: {
    width: 72,
    flexDirection: "row",
    alignItems: "center",
  },
  headerSideRight: {
    justifyContent: "flex-end",
    gap: 6,
  },
  headerBtnBlue: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: "#7DD3FC",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(37, 99, 235, 0.55)",
  },
  headerLogo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  headerMark: {
    width: 24,
    height: 18,
  },
  headerBrand: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2.4,
  },
  headerActions: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    zIndex: 2,
  },
  headerBtnGold: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  headerDot: {
    position: "absolute",
    top: 3,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EF4444",
  },

  achievementCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginTop: -12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(232, 195, 106, 0.48)",
    zIndex: 6,
    shadowColor: "#E8C36A",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  achievementInner: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 146,
  },
  achievementColLeft: {
    width: 98,
    flexGrow: 0,
    flexShrink: 0,
    paddingRight: 4,
  },
  achievementBrand: {
    color: GOLD,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 1,
  },
  achievementTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 0,
  },
  overallValue: {
    fontSize: 32,
    fontWeight: "800",
    color: GOLD,
    letterSpacing: -1,
    lineHeight: 34,
  },
  achieveBadge: {
    marginTop: 4,
    alignSelf: "flex-start",
    backgroundColor: "rgba(147, 51, 234, 0.42)",
    borderRadius: 13,
    paddingHorizontal: 7,
    paddingVertical: 4,
    maxWidth: 138,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  achieveBadgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "700",
    lineHeight: 12,
  },
  ringCenter: {
    position: "absolute",
    alignItems: "center",
  },
  ringPercent: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  ringLabel: {
    color: "#D4D4D8",
    fontSize: 10,
    marginTop: 1,
  },
  achieveDivider: {
    width: StyleSheet.hairlineWidth,
    height: 108,
    backgroundColor: "rgba(255,255,255,0.14)",
    marginLeft: 2,
    marginRight: 6,
  },
  achievementColRight: {
    flex: 1,
    minWidth: 0,
  },
  achieveRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap",
    paddingVertical: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.1)",
    gap: 4,
  },
  achieveRowLast: { borderBottomWidth: 0 },
  achieveIconWrap: {
    width: 16,
    height: 16,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  achieveRowLabel: {
    flexGrow: 1,
    flexShrink: 0,
    color: "#C4C4CC",
    fontSize: 10,
    lineHeight: 13,
  },
  metricValue: {
    color: GOLD,
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 13,
    flexShrink: 0,
    textAlign: "right",
  },
  metricUnit: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "500",
  },
  achieveCheck: {
    width: 13,
    height: 13,
    marginLeft: 2,
    flexShrink: 0,
  },

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 12, 28, 0.94)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(232, 195, 106, 0.28)",
    paddingVertical: 10,
    minHeight: 68,
    marginBottom: 14,
  },
  summaryTile: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 2,
  },
  summaryIconWrap: {
    width: 26,
    height: 22,
    borderRadius: 6,
    marginBottom: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryValue: {
    color: GOLD,
    fontSize: 17,
    fontWeight: "800",
  },
  summaryUnit: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "500",
  },
  summaryLabel: {
    color: "#D4D4D8",
    fontSize: 11,
    marginTop: 1,
  },
  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.14)",
  },

  menuLabel: {
    color: "#C8C8D0",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 3.4,
    marginBottom: 6,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(18, 14, 30, 0.96)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    gap: 12,
    minHeight: 64,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  menuText: { flex: 1 },
  menuTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 20,
  },
  menuSubtitle: {
    color: "#8B8B96",
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  menuValue: {
    color: GOLD,
    fontSize: 16,
    fontWeight: "800",
    marginRight: 4,
  },
  menuChevron: {
    color: "#6B6B76",
    fontSize: 22,
    fontWeight: "300",
    lineHeight: 22,
  },
});

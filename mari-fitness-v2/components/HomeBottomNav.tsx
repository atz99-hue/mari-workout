import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { borderRadius, colors, spacing } from "../constants/theme";
import { ScreenName } from "../types";

type NavItem = {
  id: ScreenName;
  label: string;
  icon: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "ホーム", icon: "⌂" },
  { id: "weight", label: "体重", icon: "⚖" },
  { id: "meal", label: "食事", icon: "🍽" },
  { id: "training", label: "トレーニング", icon: "💪" },
  { id: "trainingHistory", label: "履歴", icon: "📊" },
];

type Props = {
  active: ScreenName;
  onNavigate: (screen: ScreenName) => void;
};

export function HomeBottomNav({ active, onNavigate }: Props) {
  return (
    <View style={styles.bar}>
      {NAV_ITEMS.map((item) => {
        const isActive = item.id === active;
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.item}
            onPress={() => onNavigate(item.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <Text style={[styles.icon, isActive && styles.iconActive]}>{item.icon}</Text>
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: colors.surfaceSolid,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: "rgba(107,92,231,0.35)",
  },
  icon: {
    fontSize: 18,
    opacity: 0.55,
  },
  iconActive: {
    opacity: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
  labelActive: {
    color: colors.gold,
    fontWeight: "700",
  },
});

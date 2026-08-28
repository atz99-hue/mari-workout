import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { borderRadius, colors, gradients, shadows, spacing, typography } from "../constants/theme";

type Props = {
  title: string;
  subtitle?: string;
  value?: string;
  icon?: string;
  onPress?: () => void;
  children?: ReactNode;
  style?: ViewStyle;
  accent?: boolean;
  compact?: boolean;
};

export function PremiumCard({
  title,
  subtitle,
  value,
  icon,
  onPress,
  children,
  style,
  accent = false,
  compact = false,
}: Props) {
  const inner = (
    <LinearGradient
      colors={accent ? [...gradients.accent] : [...gradients.card]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, compact && styles.compact]}
    >
      <View style={styles.inner}>
        <View style={styles.header}>
          {icon ? (
            <View style={[styles.iconWrap, accent && styles.iconAccent]}>
              <Text style={styles.icon}>{icon}</Text>
            </View>
          ) : null}
          <View style={styles.textBlock}>
            <Text style={styles.label}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {value ? <Text style={styles.value}>{value}</Text> : null}
        </View>
        {children}
      </View>
    </LinearGradient>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.wrapper, style]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <View pointerEvents="none">{inner}</View>
      </TouchableOpacity>
    );
  }

  return <View style={[styles.wrapper, style]}>{inner}</View>;
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderGold,
    overflow: "hidden",
    marginBottom: spacing.md,
    ...shadows.card,
  },
  gradient: {
    borderRadius: borderRadius.lg,
  },
  compact: {
    minHeight: undefined,
  },
  inner: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: "rgba(201,169,98,0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  iconAccent: {
    backgroundColor: colors.accentSoft,
    borderColor: "rgba(107,92,231,0.3)",
  },
  icon: {
    fontSize: 22,
  },
  textBlock: {
    flex: 1,
  },
  label: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
    fontSize: 17,
  },
  subtitle: {
    ...typography.subtitle,
    color: colors.textSecondary,
    marginTop: 3,
    fontSize: 13,
  },
  value: {
    color: colors.gold,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});

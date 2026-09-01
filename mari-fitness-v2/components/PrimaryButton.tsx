import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity } from "react-native";
import { borderRadius, colors, gradients, shadows, spacing } from "../constants/theme";

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: "gold" | "ghost";
  disabled?: boolean;
};

export function PrimaryButton({ label, onPress, loading, variant = "gold", disabled }: Props) {
  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  if (variant === "ghost") {
    return (
      <TouchableOpacity
        style={[styles.ghost, disabled && styles.disabled]}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator color={colors.gold} />
        ) : (
          <Text style={styles.ghostText}>{label}</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[styles.wrapper, disabled && styles.disabled, shadows.glow]}
    >
      <LinearGradient colors={[...gradients.button]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
        {loading ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.label}>{label}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: borderRadius.md,
    overflow: "hidden",
  },
  gradient: {
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
  },
  label: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  ghost: {
    paddingVertical: spacing.md,
    alignItems: "center",
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  ghostText: {
    color: colors.gold,
    fontSize: 15,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.45,
  },
});

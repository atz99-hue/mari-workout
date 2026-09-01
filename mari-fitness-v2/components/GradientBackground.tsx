import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { colors, gradients } from "../constants/theme";

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  variant?: "default" | "hero";
};

export function GradientBackground({ children, style, variant = "default" }: Props) {
  const gradientColors =
    variant === "hero"
      ? gradients.hero
      : ([colors.backgroundElevated, colors.background] as const);

  return (
    <View style={[styles.root, style]}>
      <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFill} pointerEvents="none" />
      <View style={styles.glowTop} pointerEvents="none" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  glowTop: {
    position: "absolute",
    top: -80,
    left: "20%",
    width: "60%",
    height: 200,
    borderRadius: 999,
    backgroundColor: "rgba(201,169,98,0.06)",
  },
});

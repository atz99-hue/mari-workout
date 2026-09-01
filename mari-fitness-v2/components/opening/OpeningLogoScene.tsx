import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { OpeningSceneDef } from "../../constants/openingScenes";
import { borderRadius, colors, shadows, spacing, typography } from "../../constants/theme";

type Props = {
  scene: OpeningSceneDef;
  active: boolean;
  sceneDurationMs?: number;
};

function fadeSlideUp(value: Animated.Value, delay: number, duration = 900) {
  return Animated.timing(value, {
    toValue: 1,
    duration,
    delay,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  });
}

export function OpeningLogoScene({ scene, active, sceneDurationMs = 5000 }: Props) {
  const screenOpacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const markOpacity = useRef(new Animated.Value(0)).current;
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const brandTranslate = useRef(new Animated.Value(18)).current;
  const officialOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineScale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    if (!active) {
      screenOpacity.setValue(0);
      scale.setValue(1);
      return;
    }

    screenOpacity.setValue(0);
    scale.setValue(1);
    markOpacity.setValue(0);
    brandOpacity.setValue(0);
    brandTranslate.setValue(18);
    officialOpacity.setValue(0);
    taglineOpacity.setValue(0);
    taglineScale.setValue(0.96);

    Animated.parallel([
      Animated.timing(screenOpacity, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1.06,
        duration: sceneDurationMs,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      fadeSlideUp(markOpacity, 300, 800),
      Animated.parallel([
        fadeSlideUp(brandOpacity, 600, 1000),
        Animated.timing(brandTranslate, {
          toValue: 0,
          duration: 1000,
          delay: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      fadeSlideUp(officialOpacity, 1100, 900),
      Animated.parallel([
        fadeSlideUp(taglineOpacity, 1500, 1000),
        Animated.timing(taglineScale, {
          toValue: 1,
          duration: 1000,
          delay: 1500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [
    active,
    scene.id,
    sceneDurationMs,
    screenOpacity,
    scale,
    markOpacity,
    brandOpacity,
    brandTranslate,
    officialOpacity,
    taglineOpacity,
    taglineScale,
  ]);

  if (!active) return null;

  return (
    <Animated.View style={[styles.root, { opacity: screenOpacity }]}>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale }] }]}>
        <Animated.Image source={scene.image} style={styles.photo} resizeMode="cover" />

        <LinearGradient
          colors={["rgba(6,6,8,0.55)", "rgba(6,6,8,0.25)", "rgba(6,6,8,0.85)"]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View style={[styles.glowOrb, { backgroundColor: scene.glowColor }]} pointerEvents="none" />
      </Animated.View>

      <View style={styles.content}>
        <Animated.Text style={[styles.mark, { opacity: markOpacity }]}>✦</Animated.Text>

        <Animated.View
          style={{ opacity: brandOpacity, transform: [{ translateY: brandTranslate }] }}
        >
          <Text style={styles.brand}>MARI FITNESS</Text>
        </Animated.View>

        <Animated.View style={{ opacity: officialOpacity }}>
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.officialLabel}>Official Theme Song</Text>
            <View style={styles.dividerLine} />
          </View>
          <Text style={styles.jpSubtitle}>マリフィットネス　公式テーマソング</Text>
        </Animated.View>

        <Animated.View style={{ opacity: taglineOpacity, transform: [{ scale: taglineScale }] }}>
          <LinearGradient
            colors={["rgba(201,169,98,0.18)", "rgba(107,92,231,0.08)", "rgba(201,169,98,0.12)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.taglineCard}
          >
            <View style={styles.taglineInnerBorder} />
            <Text style={styles.taglineLabel}>THEME</Text>
            <Text style={styles.tagline}>「一歩先の自分へ」</Text>
          </LinearGradient>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
  },
  photo: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  glowOrb: {
    position: "absolute",
    top: "20%",
    alignSelf: "center",
    width: 300,
    height: 300,
    borderRadius: borderRadius.full,
    ...shadows.glow,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  mark: {
    color: colors.gold,
    fontSize: 28,
    marginBottom: spacing.lg,
    letterSpacing: 4,
  },
  brand: {
    ...typography.hero,
    color: colors.text,
    fontSize: 38,
    letterSpacing: 5,
    textAlign: "center",
    marginBottom: spacing.lg,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  dividerLine: {
    width: 36,
    height: 1,
    backgroundColor: colors.borderGold,
  },
  officialLabel: {
    ...typography.label,
    color: colors.goldLight,
    fontSize: 10,
    letterSpacing: 2.4,
  },
  jpSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    letterSpacing: 1.2,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  taglineCard: {
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderGold,
    minWidth: 280,
    alignItems: "center",
    ...shadows.card,
  },
  taglineInnerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    margin: 1,
  },
  taglineLabel: {
    ...typography.label,
    color: colors.gold,
    marginBottom: spacing.sm,
  },
  tagline: {
    ...typography.title,
    color: colors.goldLight,
    fontSize: 24,
    letterSpacing: 1.5,
    textAlign: "center",
  },
});

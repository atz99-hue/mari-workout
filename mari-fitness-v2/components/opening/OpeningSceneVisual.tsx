import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { OpeningSceneDef } from "../../constants/openingScenes";
import { colors, spacing, typography } from "../../constants/theme";

type Props = {
  scene: OpeningSceneDef;
  active: boolean;
  sceneDurationMs?: number;
};

export function OpeningSceneVisual({ scene, active, sceneDurationMs = 5000 }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const captionOpacity = useRef(new Animated.Value(0)).current;
  const captionTranslate = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    if (!active) {
      opacity.setValue(0);
      scale.setValue(1);
      captionOpacity.setValue(0);
      captionTranslate.setValue(24);
      return;
    }

    opacity.setValue(0);
    scale.setValue(1);
    captionOpacity.setValue(0);
    captionTranslate.setValue(24);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1.12,
        duration: sceneDurationMs,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(400),
        Animated.parallel([
          Animated.timing(captionOpacity, {
            toValue: 1,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(captionTranslate, {
            toValue: 0,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, [active, scene.id, sceneDurationMs, opacity, scale, captionOpacity, captionTranslate]);

  if (!active) return null;

  return (
    <Animated.View style={[styles.root, { opacity }]}>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale }] }]}>
        <Animated.Image source={scene.image} style={styles.photo} resizeMode="cover" />

        <LinearGradient
          colors={["rgba(6,6,8,0.35)", "rgba(6,6,8,0.15)", "rgba(6,6,8,0.75)"]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View style={[styles.glowOrb, { backgroundColor: scene.glowColor }]} pointerEvents="none" />

        <LinearGradient
          colors={["rgba(0,0,0,0.55)", "transparent", "rgba(0,0,0,0.65)"]}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.captionWrap,
          { opacity: captionOpacity, transform: [{ translateY: captionTranslate }] },
        ]}
      >
        <View style={styles.captionLine} />
        <Text style={styles.caption}>{scene.caption}</Text>
        {scene.subcaption ? <Text style={styles.subcaption}>{scene.subcaption}</Text> : null}
      </Animated.View>
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
    top: "10%",
    alignSelf: "center",
    width: "80%",
    height: "50%",
    borderRadius: 999,
  },
  captionWrap: {
    position: "absolute",
    bottom: "22%",
    left: spacing.xxl,
    right: spacing.xxl,
    alignItems: "center",
  },
  captionLine: {
    width: 48,
    height: 1,
    backgroundColor: colors.borderGold,
    marginBottom: spacing.md,
  },
  caption: {
    ...typography.title,
    color: colors.text,
    fontSize: 26,
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: spacing.sm,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subcaption: {
    ...typography.subtitle,
    color: colors.textMuted,
    textAlign: "center",
    letterSpacing: 1,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
});

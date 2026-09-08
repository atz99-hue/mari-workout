import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  getOpeningSceneIndex,
  OPENING_SCENE_COUNT,
  OPENING_SCENES,
} from "../constants/openingScenes";
import { colors, spacing, typography } from "../constants/theme";
import { OpeningLogoScene } from "./opening/OpeningLogoScene";
import { OpeningSceneVisual } from "./opening/OpeningSceneVisual";

type Props = {
  onComplete: () => void;
  onReady?: () => void;
  onSkip?: () => void;
  musicEnabled?: boolean;
  exitRequested?: boolean;
  playbackProgress?: number;
  songDurationSec?: number;
};

const EXIT_FADE_MS = 600;
const FALLBACK_DURATION_MS = 12000;
const SKIP_HINT_DELAY_MS = 1500;
const SCENE_FALLBACK_MS = FALLBACK_DURATION_MS / OPENING_SCENE_COUNT;

export function OpeningScreen({
  onComplete,
  onReady,
  onSkip,
  musicEnabled = true,
  exitRequested = false,
  playbackProgress = 0,
  songDurationSec = 0,
}: Props) {
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const skipHintOpacity = useRef(new Animated.Value(0)).current;
  const readyCalled = useRef(false);
  const skipHandled = useRef(false);
  const [localExitRequested, setLocalExitRequested] = useState(false);

  const shouldExit = exitRequested || localExitRequested;

  const [fallbackProgress, setFallbackProgress] = useState(0);

  const effectiveProgress = musicEnabled ? playbackProgress : fallbackProgress;
  const sceneIndex = useMemo(
    () => getOpeningSceneIndex(effectiveProgress),
    [effectiveProgress]
  );

  const sceneDurationMs = useMemo(() => {
    if (musicEnabled && songDurationSec > 0) {
      return Math.max(3000, Math.round((songDurationSec * 1000) / OPENING_SCENE_COUNT));
    }
    return SCENE_FALLBACK_MS;
  }, [musicEnabled, songDurationSec]);

  useEffect(() => {
    if (!readyCalled.current) {
      readyCalled.current = true;
      onReady?.();
    }
  }, [onReady]);

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(skipHintOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }, SKIP_HINT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [skipHintOpacity]);

  useEffect(() => {
    if (musicEnabled) return;

    const startedAt = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const progress = Math.min(1, elapsed / FALLBACK_DURATION_MS);
      setFallbackProgress(progress);
      if (progress >= 1) {
        clearInterval(timer);
      }
    }, 100);

    const completeTimer = setTimeout(() => {
      if (!skipHandled.current) {
        setLocalExitRequested(true);
      }
    }, FALLBACK_DURATION_MS);
    return () => {
      clearInterval(timer);
      clearTimeout(completeTimer);
    };
  }, [musicEnabled, onComplete]);

  useEffect(() => {
    if (!shouldExit) return;

    Animated.timing(screenOpacity, {
      toValue: 0,
      duration: EXIT_FADE_MS,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onComplete();
    });
  }, [shouldExit, onComplete, screenOpacity]);

  const handleSkip = useCallback(() => {
    if (skipHandled.current || shouldExit) return;
    skipHandled.current = true;
    onSkip?.();
  }, [shouldExit, onSkip]);

  return (
    <Pressable style={styles.root} onPress={handleSkip}>
      <Animated.View style={[styles.stage, { opacity: screenOpacity }]}>
        {OPENING_SCENES.map((scene, index) =>
          scene.isLogo ? (
            <OpeningLogoScene
              key={scene.id}
              scene={scene}
              active={sceneIndex === index}
              sceneDurationMs={sceneDurationMs}
            />
          ) : (
            <OpeningSceneVisual
              key={scene.id}
              scene={scene}
              active={sceneIndex === index}
              sceneDurationMs={sceneDurationMs}
            />
          )
        )}

        <View style={styles.sceneIndicators} pointerEvents="none">
          {OPENING_SCENES.map((scene, index) => (
            <View
              key={scene.id}
              style={[
                styles.sceneDot,
                index === sceneIndex && styles.sceneDotActive,
                index < sceneIndex && styles.sceneDotPast,
              ]}
            />
          ))}
        </View>

        <Animated.Text style={[styles.skipHint, { opacity: skipHintOpacity }]}>
          タップしてスキップ
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stage: {
    flex: 1,
  },
  sceneIndicators: {
    position: "absolute",
    top: spacing.xxl,
    alignSelf: "center",
    flexDirection: "row",
    gap: 6,
  },
  sceneDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  sceneDotActive: {
    backgroundColor: colors.gold,
    width: 18,
  },
  sceneDotPast: {
    backgroundColor: "rgba(201,169,98,0.45)",
  },
  skipHint: {
    position: "absolute",
    bottom: spacing.xl,
    alignSelf: "center",
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 1.2,
    opacity: 0.7,
  },
});

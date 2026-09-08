import { useEffect, useRef, useState } from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { PR_HIGHFIVE_IMAGES } from "../constants/imageAssets";
import { colors, spacing } from "../constants/theme";
import { UserGender } from "../types";

const DISPLAY_MS = 2500;
const ARM_MS = 400;

type Props = {
  gender: UserGender;
  onClose: () => void;
};

export function PrCutInOverlay({ gender, onClose }: Props) {
  const closed = useRef(false);
  const [interactive, setInteractive] = useState(false);

  const close = () => {
    if (closed.current) return;
    closed.current = true;
    onClose();
  };

  useEffect(() => {
    const arm = setTimeout(() => setInteractive(true), ARM_MS);
    const timer = setTimeout(close, DISPLAY_MS);
    return () => {
      clearTimeout(arm);
      clearTimeout(timer);
    };
  }, []);

  return (
    <View style={styles.root} pointerEvents="auto">
      <Pressable
        style={styles.fill}
        onPress={interactive ? close : undefined}
        disabled={!interactive}
      >
        <ImageBackground
          source={PR_HIGHFIVE_IMAGES[gender]}
          style={styles.fill}
          resizeMode="cover"
        >
          <View style={styles.scrim} />
          <View style={styles.center} pointerEvents="none">
            <Text style={styles.kicker}>PERSONAL RECORD</Text>
            <Text style={styles.title}>自己ベスト更新！</Text>
          </View>
        </ImageBackground>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    elevation: 9999,
  },
  fill: {
    flex: 1,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(6,6,8,0.35)",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  kicker: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 3,
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 40,
    fontWeight: "800",
    letterSpacing: 1,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.85)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
});

import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors, typography } from "../constants/theme";

type Props = {
  compact?: boolean;
  style?: ViewStyle;
};

/** ホーム画面ヘッダー等で使う MARI FITNESS テキストロゴ */
export function MariFitnessLogo({ compact = false, style }: Props) {
  return (
    <View style={[styles.root, style]}>
      <Text style={[styles.mark, compact && styles.markCompact]}>✦</Text>
      <View>
        <Text style={[styles.name, compact && styles.nameCompact]}>MARI FITNESS</Text>
        {!compact ? <Text style={styles.tag}>Premium Coaching</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  mark: {
    color: colors.gold,
    fontSize: 22,
    fontWeight: "700",
  },
  markCompact: {
    fontSize: 18,
  },
  name: {
    ...typography.label,
    color: colors.text,
    fontSize: 13,
    letterSpacing: 2.5,
  },
  nameCompact: {
    fontSize: 12,
    letterSpacing: 2,
  },
  tag: {
    color: colors.textSecondary,
    fontSize: 10,
    letterSpacing: 0.8,
    marginTop: 2,
  },
});

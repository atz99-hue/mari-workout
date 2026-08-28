import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors } from "../constants/theme";

const MARI_TRAINER = require("../assets/avatars/mari-trainer-avatar.png");

type Props = {
  size?: number;
  source?: ImageSourcePropType;
  style?: StyleProp<ImageStyle>;
};

/**
 * 子虎マリのアバター表示用コンポーネント。
 * source 未指定時はプレースホルダー（🐯）を表示。
 * 画像を追加する場合: assets/mari-avatar.png 等を用意し source に渡す。
 */
export function MariAvatar({ size = 48, source = MARI_TRAINER, style }: Props) {
  const dimension = { width: size, height: size, borderRadius: size / 2 };

  if (source) {
    return <Image source={source} style={[dimension, styles.image, style]} />;
  }

  return (
    <View style={[styles.placeholder, dimension, style]}>
      <Text style={[styles.emoji, { fontSize: size * 0.5 }]}>🐯</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  placeholder: {
    backgroundColor: colors.surfaceSolid,
    borderWidth: 1,
    borderColor: colors.borderGold,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    textAlign: "center",
  },
});

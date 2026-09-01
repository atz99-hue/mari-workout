import { Image, ImageSourcePropType, ImageStyle, StyleProp, StyleSheet, View } from "react-native";
import { AvatarAssetDef } from "../constants/avatarAssets";
import { colors } from "../constants/theme";

type Props = {
  asset: AvatarAssetDef;
  size: number;
  borderColor: string;
  style?: StyleProp<ImageStyle>;
  glow?: boolean;
};

/** アバター共通表示（頭部切れ防止の contain 表示） */
export function AvatarFrame({ asset, size, borderColor, style, glow = false }: Props) {
  const dimension = { width: size, height: size, borderRadius: size / 2 };

  return (
    <View
      style={[
        styles.frame,
        dimension,
        { borderColor },
        glow && styles.glow,
        style,
      ]}
    >
      <Image
        source={asset.source}
        style={styles.image}
        resizeMode={asset.resizeMode}
        accessibilityLabel={asset.role}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderWidth: 2,
    backgroundColor: colors.surfaceSolid,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  image: {
    width: "94%",
    height: "94%",
  },
});

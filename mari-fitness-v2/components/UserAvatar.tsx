import { ImageSourcePropType, ImageStyle, StyleProp, StyleSheet, Text, View } from "react-native";
import { getUserAvatarAsset } from "../constants/avatarAssets";
import { colors } from "../constants/theme";
import { UserGender } from "../types";
import { AvatarFrame } from "./AvatarFrame";

type Props = {
  size?: number;
  name?: string;
  gender?: UserGender;
  source?: ImageSourcePropType;
  style?: StyleProp<ImageStyle>;
};

function initialsFromName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed.slice(0, 1).toUpperCase();
}

export function UserAvatar({
  size = 48,
  name = "",
  gender = "male",
  source,
  style,
}: Props) {
  if (source) {
    return (
      <AvatarFrame
        asset={{
          role: gender === "female" ? "female_user" : "male_user",
          source,
          resizeMode: "contain",
        }}
        size={size}
        borderColor={colors.accent}
        style={style}
      />
    );
  }

  return (
    <AvatarFrame
      asset={getUserAvatarAsset(gender)}
      size={size}
      borderColor={colors.accent}
      style={style}
    />
  );
}

export function UserAvatarPlaceholder({
  size = 48,
  name = "",
  style,
}: {
  size?: number;
  name?: string;
  style?: StyleProp<ImageStyle>;
}) {
  const dimension = { width: size, height: size, borderRadius: size / 2 };
  const initial = initialsFromName(name);

  return (
    <View style={[styles.placeholder, dimension, style]}>
      <Text style={[styles.initial, { fontSize: size * 0.38 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.accentSoft,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  initial: {
    color: colors.text,
    fontWeight: "700",
    textAlign: "center",
  },
});

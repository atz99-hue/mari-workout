import { Image, StyleSheet, ImageStyle, StyleProp } from "react-native";
import { AvatarGender } from "../types";

const FEMALE_AVATAR = require("../assets/avatars/female-user-avatar.png");
const MALE_AVATAR = require("../assets/avatars/male-user-avatar.png");

type Props = {
  gender?: AvatarGender;
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export function UserAvatar({ gender = "female", size = 48, style }: Props) {
  const dimension = { width: size, height: size, borderRadius: size / 2 };
  const source = gender === "male" ? MALE_AVATAR : FEMALE_AVATAR;
  return <Image source={source} resizeMode="cover" style={[dimension, styles.image, style]} />;
}

const styles = StyleSheet.create({
  image: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
});

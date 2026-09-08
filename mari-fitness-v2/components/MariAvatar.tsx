import { ImageStyle, StyleProp } from "react-native";
import { MARI_TRAINER_ASSET } from "../constants/avatarAssets";
import { colors } from "../constants/theme";
import { AvatarFrame } from "./AvatarFrame";

type Props = {
  size?: number;
  style?: StyleProp<ImageStyle>;
};

/**
 * 小虎マリトレーナー（共通キャラクター）専用アバター。
 * ユーザー性別・UserAvatar とは無関係に常に MARI_TRAINER_ASSET のみを使用する。
 */
export function MariAvatar({ size = 48, style }: Props) {
  return (
    <AvatarFrame
      asset={MARI_TRAINER_ASSET}
      size={size}
      borderColor={colors.borderGold}
      glow
      style={style}
    />
  );
}

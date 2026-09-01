import { ImageResizeMode, ImageSourcePropType } from "react-native";
import { UserGender } from "../types";

export type AvatarRole = "male_user" | "female_user" | "mari_trainer";

export type AvatarAssetDef = {
  role: AvatarRole;
  source: ImageSourcePropType;
  /** 頭部・髪・耳が切れないよう contain を基本とする */
  resizeMode: ImageResizeMode;
};

/** 正式アバター asset（3種類を完全分離） */
export const AVATAR_ASSETS = {
  male_user: {
    role: "male_user",
    source: require("../assets/avatars/male_user.jpeg"),
    resizeMode: "contain",
  },
  female_user: {
    role: "female_user",
    source: require("../assets/avatars/female_user.jpeg"),
    resizeMode: "contain",
  },
  mari_trainer: {
    role: "mari_trainer",
    /** 小虎のマリトレーナー。female_user / male_user とは別 asset */
    source: require("../assets/avatars/mari_trainer.webp"),
    resizeMode: "contain",
  },
} as const satisfies Record<AvatarRole, AvatarAssetDef>;

export const USER_AVATAR_ASSETS: Record<UserGender, AvatarAssetDef> = {
  male: AVATAR_ASSETS.male_user,
  female: AVATAR_ASSETS.female_user,
};

export const MARI_TRAINER_ASSET = AVATAR_ASSETS.mari_trainer;

export function getUserAvatarAsset(gender: UserGender): AvatarAssetDef {
  return USER_AVATAR_ASSETS[gender];
}

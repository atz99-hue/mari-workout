import { ImageSourcePropType } from "react-native";

/** @deprecated constants/avatarAssets.ts を使用 */
export {
  getUserAvatarAsset,
  getUserAvatarAsset as getUserAvatarSource,
  MARI_TRAINER_ASSET,
  MARI_TRAINER_ASSET as MARI_TRAINER_AVATAR,
  USER_AVATAR_ASSETS,
  USER_AVATAR_ASSETS as USER_AVATAR_IMAGES,
} from "./avatarAssets";

/** assets/training/ — トレーニングシーン 1〜8 */
export const TRAINING_SCENE_IMAGES: ImageSourcePropType[] = [
  require("../assets/training/mari_training_scene_1.png"),
  require("../assets/training/mari_training_scene_2.png"),
  require("../assets/training/mari_training_scene_3.png"),
  require("../assets/training/mari_training_scene_4.png"),
  require("../assets/training/mari_training_scene_5.png"),
  require("../assets/training/mari_training_scene_6.png"),
  require("../assets/training/mari_training_scene_7.png"),
  require("../assets/training/mari_training_scene_8.png"),
];

/** assets/opening/ — オープニング専用画像 */
export const OPENING_IMAGES = {
  hero: require("../assets/opening/MARI_FITNESS_opening_scene.webp") as ImageSourcePropType,
  scene1: require("../assets/opening/MARI_FITNESS_opening_scene_1.webp") as ImageSourcePropType,
  scene2: require("../assets/opening/MARI_FITNESS_opening_scene_2.webp") as ImageSourcePropType,
  scene5: require("../assets/opening/MARI_FITNESS_opening_scene_5.webp") as ImageSourcePropType,
  scene6: require("../assets/opening/MARI_FITNESS_opening_scene_6.webp") as ImageSourcePropType,
};

/** オープニング8シーン用（opening 優先 + training 補完） */
export const OPENING_SCENE_IMAGES: ImageSourcePropType[] = [
  OPENING_IMAGES.scene1,
  OPENING_IMAGES.scene2,
  TRAINING_SCENE_IMAGES[2],
  TRAINING_SCENE_IMAGES[3],
  OPENING_IMAGES.scene5,
  OPENING_IMAGES.scene6,
  TRAINING_SCENE_IMAGES[6],
  OPENING_IMAGES.hero,
];

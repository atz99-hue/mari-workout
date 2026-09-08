import { ImageSourcePropType } from "react-native";
import { OPENING_SCENE_IMAGES } from "./imageAssets";

export type OpeningSceneDef = {
  id: string;
  caption: string;
  subcaption?: string;
  image: ImageSourcePropType;
  gradient: readonly [string, string, ...string[]];
  glowColor: string;
  isLogo?: boolean;
};

export const OPENING_SCENES: OpeningSceneDef[] = [
  {
    id: "start",
    caption: "トレーニングを始める",
    subcaption: "一歩を踏み出す",
    image: OPENING_SCENE_IMAGES[0],
    gradient: ["#1A1520", "#0A0A10", "#060608"],
    glowColor: "rgba(201,169,98,0.12)",
  },
  {
    id: "running",
    caption: "ランニング",
    subcaption: "風を切って走り出す",
    image: OPENING_SCENE_IMAGES[1],
    gradient: ["#101820", "#0C1018", "#060608"],
    glowColor: "rgba(107,92,231,0.10)",
  },
  {
    id: "variety",
    caption: "様々なトレーニング",
    subcaption: "体を動かし、可能性を広げる",
    image: OPENING_SCENE_IMAGES[2],
    gradient: ["#181418", "#0E0C12", "#060608"],
    glowColor: "rgba(201,169,98,0.10)",
  },
  {
    id: "strength",
    caption: "スクワットや筋力トレーニング",
    subcaption: "限界の先へ",
    image: OPENING_SCENE_IMAGES[3],
    gradient: ["#141018", "#0A0810", "#060608"],
    glowColor: "rgba(201,169,98,0.14)",
  },
  {
    id: "last-rep",
    caption: "最後の1回を頑張る",
    subcaption: "あと一息",
    image: OPENING_SCENE_IMAGES[4],
    gradient: ["#1C1410", "#100C08", "#060608"],
    glowColor: "rgba(232,213,163,0.12)",
  },
  {
    id: "finish",
    caption: "汗を流しながらやり切る",
    subcaption: "自分を超える瞬間",
    image: OPENING_SCENE_IMAGES[5],
    gradient: ["#101418", "#0A0E14", "#060608"],
    glowColor: "rgba(107,92,231,0.08)",
  },
  {
    id: "towel",
    caption: "タオルで汗を拭う",
    subcaption: "達成感と清々しさ",
    image: OPENING_SCENE_IMAGES[6],
    gradient: ["#141210", "#0C0A08", "#060608"],
    glowColor: "rgba(201,169,98,0.08)",
  },
  {
    id: "logo",
    caption: "MARI FITNESS",
    subcaption: "「一歩先の自分へ」",
    image: OPENING_SCENE_IMAGES[7],
    gradient: ["#141420", "#0A0A12", "#060608"],
    glowColor: "rgba(201,169,98,0.18)",
    isLogo: true,
  },
];

export const OPENING_SCENE_COUNT = OPENING_SCENES.length;

export function getOpeningSceneIndex(progress: number): number {
  const clamped = Math.min(1, Math.max(0, progress));
  if (clamped >= 1) return OPENING_SCENE_COUNT - 1;
  return Math.min(OPENING_SCENE_COUNT - 1, Math.floor(clamped * OPENING_SCENE_COUNT));
}

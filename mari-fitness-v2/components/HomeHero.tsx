import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Image, LayoutChangeEvent, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { AppSettings } from "../types";
import { HeroPurpleGlow } from "./HomeIcons";

const WELCOME_MARI = require("../assets/home/welcome_mari.png");
const USER_FEMALE = require("../assets/avatars/female_user.jpeg");
const USER_MALE = require("../assets/avatars/male_user.jpeg");
const WELCOME_MARI_AVATAR = require("../assets/home/welcome_mari_avatar.png");
const HERO_SCENE = require("../assets/training/mari_training_scene_5.png");

const GOLD = "#E8C36A";
const STAGE_RATIO = 390 / 250;
const MARI_RATIO = 248 / 330;
const FEMALE_RATIO = 397 / 802;
const MALE_RATIO = 364 / 731;

type Props = {
  userName: string;
  userGender: AppSettings["userGender"];
};

export function HomeHero({ userName, userGender }: Props) {
  const { width: windowW } = useWindowDimensions();
  const [measured, setMeasured] = useState({ w: 0, h: 0 });

  const onStageLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width !== measured.w || height !== measured.h) {
      setMeasured({ w: width, h: height });
    }
  };

  const stageW = measured.w > 0 ? measured.w : windowW;
  const stageH = measured.h > 0 ? measured.h : windowW / STAGE_RATIO;

  const sceneSource = userGender === "female" ? USER_FEMALE : USER_MALE;
  const userRatio = userGender === "female" ? FEMALE_RATIO : MALE_RATIO;

  const mariH = stageH * 0.98;
  const mariW = mariH * MARI_RATIO;
  const mariLeft = -stageW * 0.03;

  const userFrameLeft = stageW * 0.32;
  const userFrameW = stageW - userFrameLeft;
  const userH = stageH * 1.78;
  const userW = userH * userRatio;
  const userLeft = userFrameW - userW;

  return (
    <View style={[styles.hero, { width: windowW, marginLeft: -14 }]} collapsable={false}>
      <View pointerEvents="none" style={styles.welcome}>
        <Text style={styles.welcomeLabel}>WELCOME BACK</Text>
        <Text style={styles.welcomeName}>{userName}</Text>
        <Text style={styles.welcomeMessage}>今日も理想の身体へ。</Text>
      </View>

      <View style={styles.stage} onLayout={onStageLayout}>
        <Image source={HERO_SCENE} resizeMode="cover" style={styles.stageFill} />
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(20,10,40,0.28)", "rgba(10,6,22,0.5)", "rgba(8,6,14,0.68)"]}
          locations={[0, 0.55, 1]}
          style={styles.stageFill}
        />
        <View style={styles.glowBack} pointerEvents="none">
          <HeroPurpleGlow />
        </View>

        <View
          style={{
            position: "absolute",
            left: userFrameLeft,
            bottom: 0,
            width: userFrameW,
            height: stageH,
            overflow: "hidden",
            zIndex: 2,
          }}
        >
          <Image
            source={sceneSource}
            accessibilityLabel="ユーザー"
            resizeMode="contain"
            style={{
              position: "absolute",
              top: 0,
              left: userLeft,
              width: userW,
              height: userH,
            }}
          />
        </View>

        <Image
          source={WELCOME_MARI}
          accessibilityLabel="小虎のマリトレーナー"
          resizeMode="contain"
          style={{
            position: "absolute",
            left: mariLeft,
            bottom: 0,
            width: mariW,
            height: mariH,
            zIndex: 3,
          }}
        />

        <LinearGradient
          pointerEvents="none"
          colors={["transparent", "rgba(8,6,12,0.55)"]}
          style={styles.bottomFade}
        />

        <View pointerEvents="none" style={styles.leftBubble}>
          <Text style={styles.leftBubbleText}>
            今日もいい{"\n"}スタートだね！{"\n"}この調子でいこう！
          </Text>
        </View>

        <View pointerEvents="none" style={styles.rightBubble}>
          <Image
            source={WELCOME_MARI_AVATAR}
            style={styles.rightBubbleAvatar}
            resizeMode="cover"
            accessibilityLabel="小虎マリ"
          />
          <View style={styles.rightBubbleBody}>
            <Text style={styles.rightBubbleText}>
              小虎のマリトレーナーと{"\n"}一緒に頑張ろう！
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: "#08060C",
  },
  welcome: {
    alignItems: "center",
    paddingHorizontal: 54,
    paddingTop: 2,
    paddingBottom: 2,
  },
  welcomeLabel: {
    color: GOLD,
    letterSpacing: 3.2,
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 1,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  welcomeName: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.2,
    marginBottom: 2,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.92)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  welcomeMessage: {
    fontSize: 12,
    fontWeight: "400",
    color: "#F5F5F7",
    lineHeight: 16,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.85)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  stage: {
    width: "100%",
    aspectRatio: STAGE_RATIO,
    overflow: "hidden",
    backgroundColor: "#12081F",
    position: "relative",
  },
  stageFill: {
    ...StyleSheet.absoluteFill,
    zIndex: 0,
  },
  glowBack: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
  },
  bottomFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 36,
    zIndex: 4,
  },
  leftBubble: {
    position: "absolute",
    left: "4%",
    bottom: "8%",
    zIndex: 9,
    backgroundColor: "rgba(12, 6, 28, 0.92)",
    borderWidth: 1.2,
    borderColor: "#F0ABFC",
    borderRadius: 12,
    paddingVertical: 7,
    paddingHorizontal: 10,
    width: 124,
    shadowColor: "#E879F9",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  leftBubbleText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 13.5,
    letterSpacing: 0.1,
  },
  rightBubble: {
    position: "absolute",
    left: "42%",
    bottom: "6%",
    zIndex: 9,
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "56%",
  },
  rightBubbleAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E879F9",
    backgroundColor: "#1A1030",
    zIndex: 1,
  },
  rightBubbleBody: {
    marginLeft: -8,
    paddingLeft: 12,
    paddingRight: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(58, 16, 96, 0.94)",
    borderWidth: 1,
    borderColor: "#C084FC",
    borderRadius: 16,
    maxWidth: 176,
    shadowColor: "#A855F7",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  rightBubbleText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 13,
  },
});

import { Image, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { AppSettings } from "../types";

const HERO_FEMALE = require("../assets/home/home_hero_female.png");
const HERO_MALE = require("../assets/home/home_hero_male.png");

const GOLD = "#E8C36A";
const STAGE_RATIO = 390 / 250;

type Props = {
  userName: string;
  userGender: AppSettings["userGender"];
};

export function HomeHero({ userName, userGender }: Props) {
  const { width: windowW } = useWindowDimensions();
  const heroSource = userGender === "female" ? HERO_FEMALE : HERO_MALE;

  return (
    <View style={[styles.hero, { width: windowW, marginLeft: -14 }]} collapsable={false}>
      <View pointerEvents="none" style={styles.welcome}>
        <Text style={styles.welcomeLabel}>WELCOME BACK</Text>
        <Text style={styles.welcomeName}>{userName}</Text>
        <Text style={styles.welcomeMessage}>今日も理想の身体へ。</Text>
      </View>

      <View style={styles.stage}>
        <Image
          source={heroSource}
          accessibilityLabel="ホームヒーロー"
          resizeMode="contain"
          style={styles.heroImage}
        />
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
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
});

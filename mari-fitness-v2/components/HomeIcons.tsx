import { StyleSheet } from "react-native";
import Svg, { Circle, Defs, Ellipse, Path, RadialGradient, Rect, Stop } from "react-native-svg";

type IconProps = {
  size?: number;
  color?: string;
  filled?: boolean;
};

export function HeroPurpleGlow() {
  return (
    <Svg pointerEvents="none" style={styles.glow} width="100%" height="100%">
      <Defs>
        <RadialGradient id="mariHeroGlow" cx="50%" cy="58%" r="82%">
          <Stop offset="0" stopColor="#8B5CF6" stopOpacity="0.14" />
          <Stop offset="0.42" stopColor="#6D28D9" stopOpacity="0.07" />
          <Stop offset="0.78" stopColor="#3B0764" stopOpacity="0.03" />
          <Stop offset="1" stopColor="#000000" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#mariHeroGlow)" />
    </Svg>
  );
}

export function BellIcon({ size = 15, color = "#E8C36A" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6.4 9.2a5.6 5.6 0 1 1 11.2 0c0 3.3.86 5.2 1.7 6.4.4.56.02 1.4-.66 1.4H5.36c-.68 0-1.06-.84-.66-1.4.84-1.2 1.7-3.1 1.7-6.4Z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
      <Path
        d="M10 18.6a2.15 2.15 0 0 0 4 0"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function GearIcon({ size = 15, color = "#C4C4D0" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10.1 3.6h3.8l.7 2.2 2.1.8 1.9-1.4 2.7 2.7-1.4 1.9.8 2.1 2.2.7v3.8l-2.2.7-.8 2.1 1.4 1.9-2.7 2.7-1.9-1.4-2.1.8-.7 2.2h-3.8l-.7-2.2-2.1-.8-1.9 1.4-2.7-2.7 1.4-1.9-.8-2.1-2.2-.7v-3.8l2.2-.7.8-2.1-1.4-1.9 2.7-2.7 1.9 1.4 2.1-.8.7-2.2Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="12" r="3.1" stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

export function DumbbellIcon({ size = 16, color = "#C4B5FD" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Rect x="2.5" y="8" width="3.2" height="8" rx="1" />
      <Rect x="5.4" y="9.2" width="2.2" height="5.6" rx="0.7" />
      <Rect x="7.4" y="10.8" width="9.2" height="2.4" rx="1.1" />
      <Rect x="16.4" y="9.2" width="2.2" height="5.6" rx="0.7" />
      <Rect x="18.3" y="8" width="3.2" height="8" rx="1" />
    </Svg>
  );
}

export function PlateIcon({ size = 16, color = "#86EFAC" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="13.2" cy="13" r="6.2" stroke={color} strokeWidth={1.8} />
      <Circle cx="13.2" cy="13" r="2.4" fill={color} />
      <Path d="M4.2 5.2v13.4" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
      <Path d="M6.4 5.2v5.2c0 1.5-1.1 2.2-2.2 2.2" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}

export function SteakIcon({ size = 16, color = "#F9A8D4" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M5.2 9.4c.4-3.2 3.4-5.6 7.2-5.6 4.6 0 8.2 2.8 8.2 7.1 0 4.8-3.6 8.7-9 8.7-3.6 0-6.4-1.8-7.2-4.6-.6-2 .2-4.1.8-5.6Z" />
      <Path
        d="M9.2 9.1c1.1-.8 2.6-1.2 4.2-1.2 2.4 0 4.4 1.1 4.4 2.9 0 2.2-2.2 3.6-4.8 3.6-1.6 0-3-.5-3.8-1.4"
        fill="#1A0A16"
        opacity={0.35}
      />
    </Svg>
  );
}

export function ScaleIcon({ size = 16, color = "#93C5FD" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3.4" y="6.2" width="17.2" height="13.2" rx="3.2" stroke={color} strokeWidth={1.7} />
      <Ellipse cx="12" cy="12.2" rx="4.4" ry="3.1" stroke={color} strokeWidth={1.6} />
      <Path d="M12 10.6v2.2l1.5.9" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

export function FlameIcon({ size = 18, color = "#FB923C" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12.2 2.8s1.4 3.2-.2 5.6c-1.4 2.1-3.7 2.6-3.7 5.3 0 3.1 2.5 5.5 5.7 5.5 3.3 0 5.8-2.5 5.8-5.8 0-4.4-3.2-6.6-3.8-9.4-.3-1.3.2-2.6.2-2.6S13.6 3.9 12.2 2.8Z" />
      <Path
        d="M12.1 13.2c-.7 1.1-.6 2.4.2 3.2 1.1 1.1 2.8.7 3.4-.4.4-.8.1-1.8-.6-2.5-.9-.9-2.2-1-3-.3Z"
        fill="#FED7AA"
      />
    </Svg>
  );
}

export function BicepIcon({ size = 18, color = "#F9A8D4" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M4.2 17.2c0-1.3.8-2.3 2-2.7.2-2.6 2.3-4.6 5.1-4.6 1.3 0 2.5.5 3.4 1.3.4-.2.9-.3 1.4-.3 1.7 0 3.1 1.2 3.4 2.8 1.5.4 2.5 1.7 2.5 3.3 0 .7-.2 1.3-.6 1.8.4.5.6 1.1.6 1.8 0 1.7-1.5 3-3.5 3H8.4c-2.3 0-4.2-1.6-4.2-3.8 0-.6.1-1.1.4-1.6-.2-.3-.4-.7-.4-1Z" />
      <Path d="M9.2 10.4c.4-1.4 1.7-2.4 3.3-2.4" stroke="#1A0A16" strokeWidth={1.15} strokeLinecap="round" opacity={0.28} />
      <Path d="M18.6 13.2c.9.2 2.2.2 2.8 1.1.5.7.3 1.6-.4 2" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

export function TrophyMiniIcon({ size = 10, color = "#E8C36A" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M7 4.2h10v4.4c0 3.1-2.1 5.4-5 5.4s-5-2.3-5-5.4V4.2Z" />
      <Path d="M7 5.4H4.6C4.2 7.8 5.3 10 7.4 10.6M17 5.4h2.4C19.8 7.8 18.7 10 16.6 10.6" />
      <Rect x="10.2" y="13.8" width="3.6" height="3.2" rx="0.6" />
      <Rect x="7.6" y="17.2" width="8.8" height="2.4" rx="1" />
    </Svg>
  );
}

export function HouseIcon({ size = 20, color = "#8A8A96", filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.2 11.2 12 4.4l7.8 6.8v8.2c0 .7-.6 1.3-1.3 1.3H5.5c-.7 0-1.3-.6-1.3-1.3v-8.2Z"
        fill={filled ? color : "none"}
        stroke={color}
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
      <Path
        d="M10 20.3v-5.4h4v5.4"
        stroke={filled ? "#050508" : color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ForkKnifeIcon({ size = 20, color = "#8A8A96" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7 4.2v6.2c0 1.4-.9 2.2-2 2.2" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
      <Path d="M5 4.2v15.4M9 4.2v6.2" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
      <Path d="M17.6 4.4v15.2" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
      <Path d="M17.6 4.4c2.4 0 3.6 2.6 3.6 5.2 0 2.4-1.4 4.6-3.6 4.6" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}

export function ChartIcon({ size = 20, color = "#8A8A96" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Rect x="3.6" y="13.2" width="3.4" height="7" rx="1" />
      <Rect x="8.7" y="7.4" width="3.4" height="12.8" rx="1" />
      <Rect x="13.8" y="10.2" width="3.4" height="10" rx="1" />
      <Rect x="18.9" y="4.8" width="3.4" height="15.4" rx="1" />
    </Svg>
  );
}

export function NavDumbbellIcon({ size = 20, color = "#8A8A96" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3.4 8.4v7.2M6.2 9.6v4.8M17.8 9.6v4.8M20.6 8.4v7.2M6.2 12h11.6"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  glow: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
  },
});

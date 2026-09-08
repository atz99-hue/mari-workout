import { ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScreenName } from "../types";
import {
  ChartIcon,
  ForkKnifeIcon,
  HouseIcon,
  NavDumbbellIcon,
  ScaleIcon,
} from "./HomeIcons";

type NavItem = {
  id: ScreenName;
  label: string;
  renderIcon: (color: string, active: boolean) => ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  {
    id: "home",
    label: "ホーム",
    renderIcon: (color, active) => <HouseIcon size={22} color={color} filled={active} />,
  },
  {
    id: "weight",
    label: "体重",
    renderIcon: (color) => <ScaleIcon size={21} color={color} />,
  },
  {
    id: "meal",
    label: "食事",
    renderIcon: (color) => <ForkKnifeIcon size={21} color={color} />,
  },
  {
    id: "training",
    label: "トレーニング",
    renderIcon: (color) => <NavDumbbellIcon size={22} color={color} />,
  },
  {
    id: "trainingHistory",
    label: "履歴",
    renderIcon: (color) => <ChartIcon size={21} color={color} />,
  },
];

type Props = {
  active: ScreenName;
  onNavigate: (screen: ScreenName) => void;
  bottomInset?: number;
};

const ACTIVE = "#D946EF";
const INACTIVE = "#8A8A96";

export function HomeBottomNav({ active, onNavigate, bottomInset = 26 }: Props) {
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(10, bottomInset) }]}>
      {NAV_ITEMS.map((item) => {
        const isActive = item.id === active;
        const color = isActive ? ACTIVE : INACTIVE;
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.item}
            onPress={() => onNavigate(item.id)}
            activeOpacity={0.7}
          >
            {item.renderIcon(color, isActive)}
            <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: "#050508",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    color: INACTIVE,
    letterSpacing: 0.15,
  },
  labelActive: {
    color: ACTIVE,
    fontWeight: "700",
  },
});

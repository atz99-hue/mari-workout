declare module "@expo/vector-icons" {
  import { ComponentProps } from "react";
  import { TextProps } from "react-native";

  export type IconProps = TextProps & {
    name: string;
    size?: number;
    color?: string;
  };

  export const MaterialCommunityIcons: React.ComponentType<IconProps>;
}

declare module "@expo/vector-icons/MaterialCommunityIcons" {
  export { MaterialCommunityIcons as default } from "@expo/vector-icons";
}

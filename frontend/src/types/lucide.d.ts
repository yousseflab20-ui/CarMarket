import "react-native-svg";
import "@rneui/themed";

declare module "react-native-svg" {
  export interface SvgProps {
    color?: string;
    size?: string | number;
  }
}

declare module "@rneui/themed" {
  import { ReactElement, ComponentType } from "react";
  export interface ButtonProps {
    title?: string;
    onPress?: () => void;
    loading?: boolean;
    buttonStyle?: any;
    containerStyle?: any;
    titleStyle?: any;
    type?: "solid" | "clear" | "outline";
  }
  export const Button: ComponentType<ButtonProps>;
}

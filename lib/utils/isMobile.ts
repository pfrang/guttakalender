import { Platform } from "react-native";

export function isMobile() {
  return Platform.OS === "ios" || Platform.OS === "android";
}

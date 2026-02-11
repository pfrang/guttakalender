import { Text as RNText, StyleSheet, TextProps } from "react-native";

export function Text({ children, style }: TextProps) {
  return <RNText style={[styles.text, style]}>{children}</RNText>;
}

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
  },
});

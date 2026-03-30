import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

type ButtonProps = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  style?: StyleProp<ViewStyle>;
  size?: "small" | "medium" | "large";
};

export function Button({
  title,
  onPress,
  disabled = false,
  variant = "primary",
  size = "medium",
  style,
}: ButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <View style={[styles.wrapper, style]}>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          isPrimary ? styles.buttonPrimary : styles.buttonSecondary,
          disabled && styles.buttonDisabled,
          pressed && styles.buttonPressed,
          size === "small"
            ? styles.buttonSmall
            : size === "large"
              ? styles.buttonLarge
              : styles.buttonMedium,
          style,
        ]}
      >
        <Text
          style={[
            styles.label,
            isPrimary ? styles.labelPrimary : styles.labelSecondary,
            size === "small"
              ? styles.labelSmall
              : size === "large"
                ? styles.labelLarge
                : styles.labelMedium,
          ]}
        >
          {title}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "flex-start",
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 0,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderBottomColor: "#808080",
    borderRightColor: "#808080",
    backgroundColor: "#D4D0C8",
  },
  buttonSmall: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  buttonMedium: {
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  buttonLarge: {
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  buttonPrimary: {
    backgroundColor: "#D4D0C8",
  },
  buttonSecondary: {
    backgroundColor: "#D4D0C8",
  },
  buttonPressed: {
    borderTopColor: "#808080",
    borderLeftColor: "#808080",
    borderBottomColor: "#FFFFFF",
    borderRightColor: "#FFFFFF",
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  label: {
    fontWeight: "700",
    fontSize: 13,
    textAlign: "center",
    letterSpacing: 0,
    color: "#000000",
  },
  labelSmall: {
    fontSize: 12,
  },
  labelMedium: {
    fontSize: 13,
  },
  labelLarge: {
    fontSize: 14,
  },
  labelPrimary: {
    color: "#000000",
  },
  labelSecondary: {
    color: "#000000",
  },
});

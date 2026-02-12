import { useState } from "react";
import {
  type StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  type ViewStyle,
} from "react-native";

type InputProps = TextInputProps & {
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  label?: string;
};

export function Input({
  error,
  style,
  containerStyle,
  label,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        {...props}
        placeholderTextColor="#9CA3AF"
        autoCapitalize={props.autoCapitalize ?? "none"}
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          style,
        ]}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexShrink: 1,
    gap: 8,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#111827",
    fontSize: 16,
  },
  inputFocused: {
    borderColor: "#4F46E5",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  inputError: {
    borderColor: "#EF4444",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "500",
  },
});

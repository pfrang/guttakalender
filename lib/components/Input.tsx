import { RefObject, useState } from "react";
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
  ref?: RefObject<TextInput | null>;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  label?: string;
};

export function Input({
  ref,
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
        ref={ref}
        {...props}
        placeholderTextColor="#808080"
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
    width: "100%",
    alignSelf: "center",
    gap: 6,
  },
  input: {
    width: "100%",
    borderRadius: 0,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderTopColor: "#808080",
    borderLeftColor: "#808080",
    borderBottomColor: "#FFFFFF",
    borderRightColor: "#FFFFFF",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: "#000000",
    fontSize: 13,
    fontWeight: "400",
  },
  inputFocused: {
    borderTopColor: "#000080",
    borderLeftColor: "#000080",
    borderBottomColor: "#C0C0C0",
    borderRightColor: "#C0C0C0",
  },
  inputError: {
    borderTopColor: "#CC0000",
    borderLeftColor: "#CC0000",
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000000",
  },
  errorText: {
    color: "#CC0000",
    fontSize: 11,
    fontWeight: "700",
  },
});

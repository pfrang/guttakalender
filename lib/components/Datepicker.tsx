import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { createElement, useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { formatDateAndTime } from "../utils/date";

type DatepickerProps = {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
};

export function Datepicker({
  value,
  onChange,
  label,
  minimumDate,
  maximumDate,
  disabled = false,
}: DatepickerProps) {
  const [open, setOpen] = useState(false);

  const formatted = useMemo(() => {
    try {
      return formatDateAndTime(value, "no", "medium", true);
    } catch {
      return value.toISOString();
    }
  }, [value]);

  const onPickerChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setOpen(false);
    }
    if (event.type === "set" && selectedDate) {
      onChange(selectedDate);
    }
  };

  if (Platform.OS === "web") {
    return (
      <View style={styles.wrapper}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        {createElement("input", {
          type: "datetime-local",
          disabled,
          value: toDateTimeLocal(value),
          min: minimumDate ? toDateTimeLocal(minimumDate) : undefined,
          max: maximumDate ? toDateTimeLocal(maximumDate) : undefined,
          onChange: (event: { target: { value: string } }) => {
            const next = fromDateTimeLocal(event.target.value);
            if (next) {
              onChange(next);
            }
          },
          style: {
            width: "100%",
            borderRadius: 12,
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: "#D1D5DB",
            backgroundColor: "#FFFFFF",
            padding: "12px 14px",
            color: "#111827",
            fontSize: 16,
            boxSizing: "border-box",
          },
        })}
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          disabled && styles.triggerDisabled,
          pressed && styles.triggerPressed,
        ]}
      >
        <Text style={styles.valueText}>{formatted}</Text>
      </Pressable>

      {open ? (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            value={value}
            mode="datetime"
            display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={onPickerChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
          {Platform.OS === "ios" ? (
            <Pressable onPress={() => setOpen(false)} style={styles.doneButton}>
              <Text style={styles.doneText}>Ferdig</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  trigger: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  triggerPressed: {
    opacity: 0.92,
  },
  triggerDisabled: {
    opacity: 0.55,
  },
  valueText: {
    color: "#111827",
    fontSize: 16,
  },
  pickerContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  doneButton: {
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  doneText: {
    color: "#1D4ED8",
    fontWeight: "600",
    fontSize: 14,
  },
});

function toDateTimeLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function fromDateTimeLocal(value: string) {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

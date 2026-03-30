import { PlusIcon } from "@/lib/icons/Plus";
import { Link } from "expo-router";
import { Platform, Pressable, StyleSheet, View } from "react-native";

export function AddComponent({ path }: { path: string }) {
  const nativeTabBarHeight = Platform.select({
    ios: 49,
    android: 56,
    default: 0,
  });

  return (
    <View
      style={[styles.fabContainer, { paddingBottom: nativeTabBarHeight + 20 }]}
    >
      <Link href={path as any} asChild>
        <Pressable style={styles.fabButton}>
          <PlusIcon color="#000000" />
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    bottom: 16,
    left: 16,
  },
  fabButton: {
    backgroundColor: "#D4D0C8",
    padding: 10,
    borderRadius: 0,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderBottomColor: "#808080",
    borderRightColor: "#808080",
  },
});

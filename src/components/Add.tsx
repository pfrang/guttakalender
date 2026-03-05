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
          <PlusIcon color="#ffffff" />
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
    backgroundColor: "grey",
    padding: 12,
    borderRadius: 28,
  },
});

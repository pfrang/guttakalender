import { Doc } from "@/convex/_generated/dataModel";
import { StyleSheet, Text, View } from "react-native";

export function Group({ group }: { group: Doc<"groups"> }) {
  return (
    <View style={styles.container}>
      <Text>{group.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
});

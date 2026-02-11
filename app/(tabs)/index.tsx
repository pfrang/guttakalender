import { Text } from "@/lib/components/Text";
import { Authenticated } from "convex/react";
import { StyleSheet, View } from "react-native";
import TopSection from "../components/topSection";

export default function Index() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Authenticated>
          <TopSection />
        </Authenticated>
      </View>
      <View style={styles.main}>
        <Text>Logget inn</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

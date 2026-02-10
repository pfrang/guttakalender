import { SignInForm } from "@/lib/components/SignInForm";
import { Authenticated, Unauthenticated } from "convex/react";
import { StyleSheet, View } from "react-native";
import TopSection from "./topSection";

export default function Index() {

  return (
    <View
      style={styles.container}
    >
      <View style={styles.header}>
        <Authenticated>
          <TopSection/>
          
        </Authenticated>
      </View>
      <View style={styles.main}>
        <Authenticated>
          Logget inn
        </Authenticated>
        <Unauthenticated>
          <SignInForm />
        </Unauthenticated>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
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
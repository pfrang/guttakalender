import { api } from "@/convex/_generated/api";
import { Button } from "@/lib/components/Button";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery } from "convex/react";
import { Link, useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { AddComponent } from "../components/Add";
import { Group } from "../components/Group";

export default function Index() {
  const router = useRouter();
  const user = useQuery(api.users.getCurrentUser);
  const headerHeight = useHeaderHeight();

  return (
    <View style={[styles.container, { paddingTop: headerHeight + 12 }]}>
      <View
        style={{
          justifyContent: "space-between",
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Link href="/JoinGroup" asChild>
          <Button title="Bli med i gruppe" />
        </Link>
        <Link href="/settings" asChild>
          <Button variant="secondary" title="Instillinger" />
        </Link>
      </View>
      <Text>Dine grupper</Text>
      <FlatList
        data={user?.groups ?? []}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/group/[id]",
                params: { id: item },
              })
            }
          >
            <Group groupId={item} />
          </Pressable>
        )}
        keyExtractor={(item) => item}
        contentContainerStyle={{
          gap: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      />
      <AddComponent path="/AddGroup" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
});

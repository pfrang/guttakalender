import { api } from "@/convex/_generated/api";
import { SignOutButton } from "@/lib/components/SignOut";
import { useQuery } from "convex/react";
import { View } from "react-native";

export default function TopSection() {
    const user = useQuery(api.users.getCurrentUser);

    return (
        <>
            <View>
                {user?.name}
            </View>
            <View>
                <SignOutButton />
            </View>
        </>
    )
}
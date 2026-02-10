import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { Button } from "./Button";

export function SignOutButton() {
    const { isAuthenticated } = useConvexAuth();
    const { signOut } = useAuthActions();
    return (
        <>
            {isAuthenticated && (
                <Button
                    title="Logg ut"
                    onPress={() => void signOut()}
                />
            )}
        </>
    );
}

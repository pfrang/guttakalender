import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

export function SignOutButton() {
    const { isAuthenticated } = useConvexAuth();
    const { signOut } = useAuthActions();
    return (
        <>
            {isAuthenticated && (
                <button
                    className="rounded-md bg-slate-200 px-2 py-1 text-dark dark:bg-slate-800 dark:text-light"
                    onClick={() => void signOut()}
                >
                    Logg ut
                </button>
            )}
        </>
    );
}

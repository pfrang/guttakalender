import { convexAuth } from "@convex-dev/auth/server";

import { Password } from "./provider";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
    providers: [Password],
});

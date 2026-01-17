import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

import { Button } from "./ui/Button";

export function SignIn() {
    const { signIn } = useAuthActions();
    const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
    const [error, setError] = useState<string | null>(null);

    return (
        <div className="mx-auto flex w-96 flex-col gap-8">
            <p>Du må logge inn for å se gættakalenderen</p>
            <form
                className="flex flex-col gap-2"
                onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    formData.set("flow", flow);
                    void signIn("password", formData).catch(() => {
                        const errorMsg =
                            flow === "signIn" ? "Feil brukernavn eller passord" : "Konto kunne ikke opprettes";

                        setError(errorMsg);
                    });
                }}
            >
                {/*<input
          className="bg-light dark:bg-dark text-dark dark:text-light rounded-md p-2 border-2 border-slate-200 dark:border-slate-800"
          type="email"
          name="email"
          placeholder="Email"
        />*/}
                <input
                    className="rounded-md border-2 border-slate-200 bg-light p-2 text-dark dark:border-slate-800 dark:bg-dark dark:text-light"
                    type="text"
                    name="name"
                    placeholder="Brukernavn"
                />
                <input
                    className="rounded-md border-2 border-slate-200 bg-light p-2 text-dark dark:border-slate-800 dark:bg-dark dark:text-light"
                    type="password"
                    name="password"
                    placeholder="Password"
                />
                <Button type="submit">{flow === "signIn" ? "Logg inn " : "Mekk en konto"}</Button>
                <div className="flex flex-row gap-2">
                    <span>{flow === "signIn" ? "Har du ikke konto?" : "Har du konto?"}</span>
                    <span
                        className="cursor-pointer text-dark underline hover:no-underline dark:text-light"
                        onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
                    >
                        {flow === "signIn" ? "Registrer ny konto" : "Logg inn"}
                    </span>
                </div>
                {error && (
                    <div className="rounded-md border-2 border-red-500/50 bg-red-500/20 p-2">
                        <p className="font-mono text-xs text-dark dark:text-light">{error}</p>
                    </div>
                )}
            </form>
        </div>
    );
}

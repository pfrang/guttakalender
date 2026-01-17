"use client";

import { Authenticated, Unauthenticated } from "convex/react";

import { Chat } from "./components/Chat";
import { Plans } from "./components/Plans";
import { SignIn } from "./components/SignInForm";
import { SignOutButton } from "./components/SignOut";
import { User } from "./components/User";
import { Users } from "./components/Users";

export default function App() {
    return (
        <>
            <header className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-slate-200 bg-light p-4 dark:border-slate-800 dark:bg-dark">
                Guttakalender
                <Authenticated>
                    <div className="flex items-center gap-4">
                        <User />
                        <SignOutButton />
                    </div>
                </Authenticated>
            </header>
            <main className="flex flex-col gap-16 p-4 text-sm leading-none lg:p-8 lg:text-base">
                <Authenticated>
                    <section className="flex flex-col justify-between gap-4 lg:flex-row">
                        <div className="flex w-full flex-col gap-8">
                            <Users />
                            <Plans />
                        </div>
                        <Chat />
                    </section>
                    <section></section>
                </Authenticated>
                <Unauthenticated>
                    <SignIn />
                </Unauthenticated>
            </main>
        </>
    );
}

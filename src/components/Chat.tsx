import { cn } from "@/utils/cn";
import { formatDateAndTime } from "@/utils/date";
import { useMutation, useQuery } from "convex/react";
import { FormEvent, useEffect, useRef } from "react";

import { api } from "../../convex/_generated/api";

import { Button } from "./ui/Button";
import { EmojiReactions } from "./ui/EmojiReactions";

export function Chat() {
    const messages = useQuery(api.chat.getChats);
    const currentUser = useQuery(api.users.getCurrentUser);
    const sendMessage = useMutation(api.chat.addChat);
    const users = useQuery(api.users.getUsers);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messages?.length && chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const message = formData.get("message") as string;
        if (message.trim()) {
            void sendMessage({ message });
            event.currentTarget.reset();
        }
    };

    function isChatFromUser(messageUserId: string) {
        return messageUserId === currentUser?._id;
    }

    function onReaction() {}

    return (
        <div className="flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-zinc-900">Gættachat</h2>
            </div>

            <div ref={chatContainerRef} className="flex-1 overflow-y-auto bg-zinc-50 px-4 py-5">
                <div className="space-y-3">
                    {messages?.map((msg) => {
                        const user = users?.find((u) => u._id === msg.userId);
                        const isCurrentUser = isChatFromUser(msg.userId);
                        return (
                            <div
                                className={cn("flex items-center", {
                                    "justify-end": isCurrentUser,
                                    "justify-start": !isCurrentUser,
                                })}
                                key={msg._id}
                            >
                                {isCurrentUser && (
                                    <p className="mr-auto text-sm text-zinc-800">
                                        {formatDateAndTime(new Date(msg._creationTime), "no", "medium", true)}
                                    </p>
                                )}
                                <div
                                    onClick={onReaction}
                                    className={cn(
                                        "max-w-[80%] rounded-2xl bg-white px-4 py-3 text-sm text-zinc-800 shadow-sm ring-1 ring-zinc-200",
                                        {
                                            "bg-zinc-900 text-white": isCurrentUser,
                                        }
                                    )}
                                >
                                    <EmojiReactions chatId={msg._id} />
                                    <p className="leading-relaxed">{msg.message}</p>
                                    <p
                                        className={cn("mt-1 text-xs text-zinc-400", {
                                            "text-white/60": isCurrentUser,
                                        })}
                                    >
                                        {user?.name}
                                    </p>
                                </div>
                                {!isCurrentUser && (
                                    <p className="ml-auto text-center text-sm text-zinc-800">
                                        {formatDateAndTime(new Date(msg._creationTime), "no", "medium", true)}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="border-t border-zinc-200 bg-white px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex-1">
                        <label htmlFor="message" className="sr-only">
                            Message
                        </label>
                        <input
                            id="message"
                            name="message"
                            placeholder="Send en melding til boaza…"
                            className="max-h-40 w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                        />
                    </div>

                    <Button type="submit">Send</Button>
                </div>
            </form>
        </div>
    );
}

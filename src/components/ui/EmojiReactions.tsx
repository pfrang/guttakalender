import { EMOJI_CATEGORIES, QUICK_EMOJIS } from "@/config/emojis";
import { cn } from "@/utils/cn";
import { useMutation } from "convex/react";
import { Smile, X } from "lucide-react";
import { useId, useState } from "react";

import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

type Reaction = {
    emoji: string;
    userId: string;
};

type EmojiReactionsProps = {
    chatId: Id<"chat">;
    reactions?: Reaction[];
    currentUserId?: string;
    isCurrentUser?: boolean;
};

export function EmojiReactions({ chatId, reactions = [], currentUserId, isCurrentUser }: EmojiReactionsProps) {
    const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>("Smileys");
    const [searchQuery, setSearchQuery] = useState("");
    const addReaction = useMutation(api.chat.addReaction);
    const popoverId = useId();

    // Group reactions by emoji and count them
    const groupedReactions = reactions.reduce(
        (acc, reaction) => {
            if (!acc[reaction.emoji]) {
                acc[reaction.emoji] = { count: 0, userIds: [] };
            }
            acc[reaction.emoji].count++;
            acc[reaction.emoji].userIds.push(reaction.userId);
            return acc;
        },
        {} as Record<string, { count: number; userIds: string[] }>
    );

    const handleReaction = async (emoji: string) => {
        await addReaction({ chatId, emoji });
        setSearchQuery("");
        // Close the popover
        const popover = document.getElementById(popoverId);
        if (popover) {
            popover.hidePopover();
        }
    };

    const hasUserReacted = (emoji: string) => {
        return groupedReactions[emoji]?.userIds.includes(currentUserId || "");
    };

    // Get all emojis for search
    const allEmojis = Object.values(EMOJI_CATEGORIES).flat();
    const filteredEmojis = searchQuery
        ? allEmojis.filter((emoji) => emoji.includes(searchQuery))
        : EMOJI_CATEGORIES[activeCategory];

    return (
        <div className={cn("flex items-center gap-1", isCurrentUser ? "flex-row-reverse" : "flex-row")}>
            {/* Existing reactions display */}
            {Object.entries(groupedReactions).length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {Object.entries(groupedReactions).map(([emoji, data]) => (
                        <button
                            key={emoji}
                            onClick={() => void handleReaction(emoji)}
                            className={cn(
                                "flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors",
                                hasUserReacted(emoji)
                                    ? "border-blue-400 bg-blue-50 text-blue-700"
                                    : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                            )}
                        >
                            <span>{emoji}</span>
                            <span>{data.count}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Add reaction button - triggers popover */}
            <button
                popoverTarget={popoverId}
                className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
                aria-label="Add reaction"
            >
                <Smile size={16} />
            </button>

            {/* Native HTML5 Popover - positioned towards center */}
            <div
                id={popoverId}
                popover="auto"
                className="m-auto size-100 rounded-2xl border border-zinc-200 bg-white shadow-2xl backdrop:bg-black/20"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
                    <h3 className="font-semibold text-zinc-900">Velg en emoji</h3>
                    <button
                        popoverTarget={popoverId}
                        popoverTargetAction="hide"
                        className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Search */}
                <div className="border-b border-zinc-100 px-4 py-2">
                    <input
                        type="text"
                        placeholder="Søk etter emoji..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                    />
                </div>

                {/* Quick access row */}
                <div className="flex gap-1 border-b border-zinc-100 px-4 py-2">
                    {QUICK_EMOJIS.map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => void handleReaction(emoji)}
                            className={cn(
                                "rounded-lg p-1.5 text-xl transition-transform hover:scale-110 hover:bg-zinc-100",
                                hasUserReacted(emoji) && "bg-blue-50"
                            )}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>

                {/* Category tabs */}
                {!searchQuery && (
                    <div className="flex gap-1 overflow-x-auto border-b border-zinc-100 px-2 py-2">
                        {Object.keys(EMOJI_CATEGORIES).map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category as keyof typeof EMOJI_CATEGORIES)}
                                className={cn(
                                    "rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                                    activeCategory === category
                                        ? "bg-zinc-900 text-white"
                                        : "text-zinc-600 hover:bg-zinc-100"
                                )}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                )}

                {/* Emoji grid */}
                <div className="flex-1 overflow-y-auto p-3">
                    <div className="grid grid-cols-10 gap-1">
                        {filteredEmojis.map((emoji, index) => (
                            <button
                                key={`${emoji}-${index}`}
                                onClick={() => void handleReaction(emoji)}
                                className={cn(
                                    "rounded-lg p-2 text-2xl transition-transform hover:scale-110 hover:bg-zinc-100",
                                    hasUserReacted(emoji) && "bg-blue-50"
                                )}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                    {filteredEmojis.length === 0 && (
                        <p className="py-8 text-center text-sm text-zinc-400">Ingen emojis funnet</p>
                    )}
                </div>
            </div>
        </div>
    );
}

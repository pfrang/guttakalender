import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function Accordion({
    children,
    header,
    defaultOpen = false,
}: {
    children: React.ReactNode;
    header: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="overflow-hidden rounded-lg border border-stone-300">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="grid w-full grid-cols-[1fr_auto] items-center gap-2 p-4 text-left transition-colors hover:bg-stone-50"
            >
                <div>{header}</div>
                <ChevronDown
                    className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>
            {isOpen && <div className="p-4 pt-0">{children}</div>}
        </div>
    );
}

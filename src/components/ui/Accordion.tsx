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
                className="flex w-full items-center justify-between gap-2 p-4 text-left transition-colors hover:bg-stone-50"
            >
                {header}
                <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && <div className="border-t border-stone-200 p-4 pt-0">{children}</div>}
        </div>
    );
}

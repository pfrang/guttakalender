import { cn } from "@/utils/cn";

type Variant = "primary" | "secondary" | "destructive";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
}

export function Button({ children, className, variant, type, onClick, ...rest }: Props) {
    return (
        <button
            onClick={onClick}
            type={type || "button"}
            className={cn(
                "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium shadow-sm transition focus:ring-2 focus:outline-none lg:px-4 lg:py-3",
                "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                {
                    "bg-zinc-900 text-white hover:bg-zinc-800 focus:ring-zinc-300": variant === "primary" || !variant,
                    "border border-zinc-200 bg-white text-zinc-900 shadow hover:bg-zinc-100 focus:ring-zinc-300":
                        variant === "secondary",
                    "bg-red-600 text-white hover:bg-red-500 focus:ring-red-300": variant === "destructive",
                },
                className
            )}
            {...rest}
        >
            {children}
        </button>
    );
}

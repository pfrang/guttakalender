interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}

export function Input({ className, ...props }: Props) {
    return (
        <input
            className={`rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none lg:min-w-92 ${className}`}
            {...props}
        />
    );
}

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string;
}

export function Textarea({ className, ...props }: Props) {
    return (
        <textarea
            rows={2}
            className={`rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none lg:min-w-92 ${className}`}
            {...props}
        />
    );
}

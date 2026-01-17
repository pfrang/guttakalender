import { useUser } from "@/hooks/user";
import "@/styles/datepicker.css";
import "@/styles/modal.css";
import { useMutation } from "convex/react";
import { Calendar, LoaderCircle } from "lucide-react";
import { forwardRef, useRef, useState } from "react";
import DatePicker from "react-datepicker";

import { api } from "../../convex/_generated/api";

import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";
import { Spinner } from "./ui/Spinner";
import { Textarea } from "./ui/Textarea";

// Custom input that matches your Input component style
const DateInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ value, onClick, onChange, name }, ref) => (
        <div
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    (onClick as React.MouseEventHandler<HTMLDivElement>)?.(
                        e as unknown as React.MouseEvent<HTMLDivElement>
                    );
                }
            }}
            className={`relative w-full cursor-pointer rounded-md border border-gray-300 px-4 py-2 hover:outline-2 focus:ring-2 focus:ring-blue-500 focus:outline-none lg:min-w-92`}
        >
            <input
                id="date"
                name={name}
                ref={ref}
                value={value}
                onChange={onChange}
                readOnly
                tabIndex={-1}
                className="pointer-events-none bg-transparent focus:ring-0 focus:outline-none"
                placeholder="Velg dato"
            />
            <Calendar className="absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
        </div>
    )
);
DateInput.displayName = "DateInput";

export function AddPlan() {
    const addPlan = useMutation(api.plans.addPlan);
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [date, setDate] = useState<Date | null>(new Date());
    const user = useUser();
    console.log(isLoading);

    const dialogRef = useRef<HTMLDialogElement>(null);

    const openModal = () => {
        dialogRef.current?.showModal();
    };

    const closeModal = () => {
        dialogRef.current?.close();
    };

    async function onSubmit(event: React.FormEvent) {
        if (!user || !date) {
            throw new Error("Unauthorized");
        }
        setLoading(true);
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);

        const location = formData.get("location") as string;
        const plan = formData.get("plan") as string;
        const dateToSubmit = date.toISOString();
        const attendees = [user?._id];

        try {
            await addPlan({ location, date: dateToSubmit, plan, userId: user?._id, attendees });
            form.reset();
            closeModal();
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to add plan");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Button onClick={openModal} className="mb-6 self-end">
                Legg til ny plan
            </Button>
            <dialog
                className="relative m-auto max-h-[85vh] max-w-lg rounded-lg border-none p-6 shadow-xl"
                ref={dialogRef}
                onClick={(e) => {
                    if (e.target === dialogRef.current) {
                        closeModal();
                    }
                }}
            >
                <div className="p-2">
                    <form
                        method="dialog"
                        onSubmit={(e) => {
                            void onSubmit(e);
                        }}
                    >
                        <div className="flex flex-col gap-6">
                            <input type="hidden" name="userId" />
                            <Label>Hvor skjer det?</Label>
                            <Input
                                className="hover:outline-2"
                                name="location"
                                type="text"
                                placeholder="Hvor"
                                required
                            />
                            <Label>Hva skjer?</Label>
                            <Textarea className="hover:outline-2" name="plan" placeholder="Plan" required />
                            <Label>Når skjer det?</Label>
                            <DatePicker
                                name="date"
                                selected={date}
                                onChange={(date: Date | null) => setDate(date)}
                                customInput={<DateInput name="date" />}
                                dateFormat={"dd.MM.yyyy"}
                                popperPlacement="bottom"
                            />
                            <div className="flex w-full justify-center">
                                {error && <p className="text-red-500">{error}</p>}
                                {isLoading && <Spinner />}
                            </div>
                            <Button disabled={isLoading} type="submit">
                                Add Plan
                            </Button>
                        </div>
                    </form>
                </div>
            </dialog>
        </>
    );
}

import "@/styles/modal.css";
import { useMutation, useQuery } from "convex/react";
import { Settings } from "lucide-react";
import { FormEvent, useRef } from "react";

import { api } from "../../convex/_generated/api";

import { Button } from "./ui/Button";

export function User() {
    const user = useQuery(api.users.getCurrentUser);
    const changeUserName = useMutation(api.users.mutateUser);
    const dialogRef = useRef<HTMLDialogElement>(null);

    const openModal = () => {
        dialogRef.current?.showModal();
    };

    const closeModal = () => {
        dialogRef.current?.close();
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const name = formData.get("name") as string;
        if (name.trim()) {
            void changeUserName({ name: name.trim() });
            closeModal();
        }
    };
    return (
        <>
            <dialog
                ref={dialogRef}
                className="m-auto max-h-[85vh] max-w-lg rounded-lg border-none p-6 shadow-xl"
                onClick={(e) => {
                    if (e.target === dialogRef.current) {
                        closeModal();
                    }
                }}
            >
                <div className="flex flex-col gap-4">
                    <form method="dialog" onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <label htmlFor="name">Endre brukernavn</label>
                        <input
                            className="rounded-md border-2 border-slate-200 p-2"
                            type="text"
                            id="name"
                            required
                            name="name"
                            defaultValue={user?.name || ""}
                        />
                        <div className="flex gap-4">
                            <Button type="submit">Lagre</Button>
                            <Button variant="secondary" onClick={closeModal}>
                                Lukk
                            </Button>
                        </div>
                    </form>
                </div>
            </dialog>

            <button className="flex cursor-pointer gap-4 underline hover:no-underline" onClick={openModal}>
                <p>{user?.name}</p>
                <Settings />
            </button>
        </>
    );
}

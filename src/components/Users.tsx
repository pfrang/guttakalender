import { useQuery } from "convex/react";

import { api } from "../../convex/_generated/api";

export function Users() {
    const users = useQuery(api.users.getUsers);

    if (!users) {
        return <div>Laster brukere...</div>;
    }

    return (
        <div className="flex flex-col gap-2">
            <h2>Brukere</h2>
            <ul className="flex gap-2">
                {users.map((user) => (
                    <li key={user._id}>{user.name}</li>
                ))}
            </ul>
        </div>
    );
}

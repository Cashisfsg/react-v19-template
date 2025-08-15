import { use } from "react";

export const Users = ({ promise }) => {
    const users = use(promise);

    return users.map(user => (
        <pre key={user.id}>{JSON.stringify(user, null, 4)}</pre>
    ));
};

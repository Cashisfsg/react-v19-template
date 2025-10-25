import { useSyncExternalStore } from "react";

const getSnapshot = () => {
    return navigator.onLine;
};

const getServerSnapshot = () => true;

const subscribe = (callback: () => void) => {
    window.addEventListener("online", callback);
    window.addEventListener("offline", callback);

    return () => {
        window.removeEventListener("online", callback);
        window.removeEventListener("offline", callback);
    };
};

export const useOnlineStatus = () => {
    const isOnline = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot
    );

    return isOnline;
};

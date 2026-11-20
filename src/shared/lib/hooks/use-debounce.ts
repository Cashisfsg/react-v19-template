import { useEffect, useMemo } from "react";

import { useEventCallback } from "./use-event-callback";

import { debounce } from "../utils/debounce";

export function useDebounce<T extends unknown[]>(
    callback: (...args: T) => void,
    timeout: number
) {
    const memoizedCallback = useEventCallback(callback);

    const debouncedCallback = useMemo(
        () =>
            debounce((...args: T) => {
                memoizedCallback(...args);
            }, timeout),
        [timeout, memoizedCallback]
    );

    useEffect(
        () => () => {
            debouncedCallback.cancel();
        },
        [debouncedCallback]
    );

    return debouncedCallback;
}

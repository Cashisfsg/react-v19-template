import { useCallback, useLayoutEffect, useRef } from "react";

export const useEventCallback = <T extends unknown[], R>(
    callback: (...args: T) => R
) => {
    const callbackRef = useRef(callback);

    useLayoutEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const eventCallback = useCallback(
        (...args: T) => {
            return callbackRef.current.apply(null, args);
        },
        [callbackRef]
    );

    return eventCallback;
};

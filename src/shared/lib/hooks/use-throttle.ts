import { useEffect, useMemo } from "react";

import { useEventCallback } from "./use-event-callback";

export const rafThrottle = <T extends unknown[]>(
    callback: (...args: T) => void
) => {
    let rafId: number | null = null;

    const throttled = (...args: T) => {
        if (typeof rafId === "number") return;

        rafId = requestAnimationFrame(() => {
            callback(...args);
            rafId = null;
        });
    };

    throttled.cancel = () => {
        if (typeof rafId !== "number") return;

        cancelAnimationFrame(rafId);
    };

    return throttled;
};

export const useRafThrottle = <T extends unknown[]>(
    callback: (...args: T) => void
) => {
    const memoizedCallback = useEventCallback(callback);

    const throttledCallback = useMemo(
        () =>
            rafThrottle((...args: T) => {
                memoizedCallback(...args);
            }),
        [memoizedCallback]
    );

    useEffect(
        () => () => {
            throttledCallback.cancel();
        },
        [throttledCallback]
    );

    return throttledCallback;
};

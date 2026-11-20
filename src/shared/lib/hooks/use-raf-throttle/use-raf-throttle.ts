import { useEffect, useMemo } from "react";

import { rafThrottle } from "../../utils/raf-throttle";
import { useEventCallback } from "../use-event-callback";

/**
 * A callback that runs at most once a frame, calling the latest closure.
 * Stable across renders, and cancelled on unmount.
 */
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

import { useEffect, useMemo } from "react";

import { debounce } from "../../utils/debounce";
import { useEventCallback } from "../use-event-callback";

/**
 * A callback that waits for the calls to stop before running.
 *
 * The one to reach for when the value being debounced does not need to be
 * state: an uncontrolled input holds its own text, and this carries the
 * settled text out of it without the component re-rendering once per
 * keystroke.
 *
 * `useEventCallback` keeps the debounced function stable while still calling
 * the latest closure — without it, a caller that redefines its handler on
 * every render would rebuild the timer and never settle.
 *
 * Cancelled on unmount, so a pending call cannot fire into a tree that is
 * gone.
 */
export const useDebounceCallback = <T extends unknown[]>(
    callback: (...args: T) => void,
    ms: number
) => {
    const memoizedCallback = useEventCallback(callback);

    const debouncedCallback = useMemo(
        () =>
            debounce((...args: T) => {
                memoizedCallback(...args);
            }, ms),
        [memoizedCallback, ms]
    );

    useEffect(
        () => () => {
            debouncedCallback.cancel();
        },
        [debouncedCallback]
    );

    return debouncedCallback;
};

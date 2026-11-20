import { useEffect, useState } from "react";

/**
 * The value as it was once it stopped changing for `delayMs`: a search
 * query that is sent when the typing pauses, not on every keystroke.
 *
 * The counterpart to `useDebounceCallback`, for a value that already is
 * state. A pending value is dropped on unmount and when the value changes
 * again, and the first value is returned at once.
 */
export const useDebouncedValue = <T>(value: T, delayMs: number): T => {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebounced(value);
        }, delayMs);
        return () => {
            clearTimeout(timer);
        };
    }, [value, delayMs]);

    return debounced;
};

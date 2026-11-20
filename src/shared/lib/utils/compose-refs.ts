import type { Ref, RefCallback } from "react";

/**
 * Composes multiple refs (callback or object) into a single callback ref that
 * honors React 19's callback-ref cleanup contract.
 *
 * Contract with React 19: once the composed callback returns a cleanup, React
 * calls only that cleanup on unmount and never re-invokes the composed callback
 * with `null`. That means every inner ref MUST get a cleanup slot in the
 * aggregate, even if the ref itself didn't return one — otherwise a legacy
 * callback ref (that clears its target via the classic `(null)` call) would
 * never be notified on unmount and would leak a reference to the detached node.
 */
export const composeRefs = <T>(
    ...refs: (Ref<T> | undefined)[]
): RefCallback<T> => {
    return (value: T) => {
        const cleanups: (() => void)[] = [];
        for (const ref of refs) {
            if (typeof ref === "function") {
                const cleanup = ref(value);
                // Fall back to the classic legacy contract so refs that don't
                // return their own cleanup still see `(null)` on unmount.
                cleanups.push(
                    typeof cleanup === "function" ? cleanup : () => ref(null)
                );
            } else if (ref && typeof ref === "object" && "current" in ref) {
                ref.current = value;
                cleanups.push(() => {
                    ref.current = null;
                });
            }
        }
        return () => {
            for (const cleanup of cleanups) cleanup();
        };
    };
};

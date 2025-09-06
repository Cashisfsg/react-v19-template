import type { Ref, RefCallback } from "react";

export const composeRefs = <T>(
    ...refs: (Ref<T> | undefined)[]
): RefCallback<T> => {
    return (value: T) => {
        for (const ref of refs) {
            if (typeof ref === "function") {
                ref(value);
            } else if (ref && typeof ref === "object" && "current" in ref) {
                ref.current = value;
            }
        }
    };
};

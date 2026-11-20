import { useEffect, useEffectEvent } from "react";

import { DEFAULT_OPTIONS, keyOf, optionsOf } from "./options";

/**
 * Watches the element in `target` while the component is mounted, calling
 * the latest `callback` on each batch of mutations.
 *
 * For an element that is there from the first render. One that comes and
 * goes needs `useMutationObserverCallback`: an effect does not run again when
 * only a ref's element changes.
 */
export const useMutationObserverEffect = (
    target: React.RefObject<Element | null>,
    callback: MutationCallback,
    options: MutationObserverInit = DEFAULT_OPTIONS
) => {
    const onMutation = useEffectEvent(callback);
    const optionsKey = keyOf(options);

    useEffect(() => {
        const node = target.current;
        if (node === null) return;

        const observer = new MutationObserver((mutations, self) => {
            onMutation(mutations, self);
        });
        observer.observe(node, optionsOf(optionsKey));

        return () => {
            observer.disconnect();
        };
    }, [target, optionsKey]);
};

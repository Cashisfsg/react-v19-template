import { useCallback } from "react";

import { useEventCallback } from "../use-event-callback";

import { DEFAULT_OPTIONS, keyOf, optionsOf } from "./options";

/**
 * A ref callback that watches whatever element it is attached to, calling the
 * latest `callback` on each batch of mutations. A new element is observed in
 * place of the old one, and React 19 runs the cleanup when it goes.
 *
 * `useEventCallback` rather than `useEffectEvent`: an effect event may only be
 * called from an effect, and a ref callback is not one.
 */
export const useMutationObserverCallback = (
    callback: MutationCallback,
    options: MutationObserverInit = DEFAULT_OPTIONS
) => {
    const onMutation = useEventCallback(callback);
    const optionsKey = keyOf(options);

    return useCallback<React.RefCallback<Element>>(
        node => {
            if (node === null) return;

            const observer = new MutationObserver(onMutation);
            observer.observe(node, optionsOf(optionsKey));

            return () => {
                observer.disconnect();
            };
        },
        [onMutation, optionsKey]
    );
};

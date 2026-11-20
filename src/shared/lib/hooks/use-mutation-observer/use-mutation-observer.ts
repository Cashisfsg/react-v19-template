import { useCallback, useEffect, useEffectEvent } from "react";

import { useEventCallback } from "../use-event-callback";

const DEFAULT_OPTIONS: MutationObserverInit = {
    childList: true,
    subtree: true
};

/* The options as a dependency: a caller's object literal is new each render,
   and would observe again every time. Its JSON is the same while it is. */
const keyOf = (options: MutationObserverInit) => JSON.stringify(options);

const optionsOf = (key: string) => JSON.parse(key) as MutationObserverInit;

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

import { useCallback, useEffect, useEffectEvent, useRef } from "react";

export function useMutationObserverEffect(
    target: React.RefObject<Element | null>,
    callback: MutationCallback,
    options: MutationObserverInit = { childList: true, subtree: true }
) {
    const observerRef = useRef<MutationObserver | null>(null);

    const onMutation = useEffectEvent(callback);

    const optionsKey = JSON.stringify(options);

    useEffect(() => {
        const node = target.current;

        if (!node) return;

        if (!observerRef.current) {
            observerRef.current = new MutationObserver(
                (mutations, observer) => {
                    onMutation(mutations, observer);
                }
            );
        }

        const observer = observerRef.current;

        observer.disconnect();
        observer.observe(node, options);

        return () => observer.disconnect();
    }, [target, optionsKey]);
}

export function useMutationObserverCallback(
    callback: MutationCallback,
    options: MutationObserverInit = { childList: true, subtree: true }
) {
    const observerRef = useRef<MutationObserver | null>(null);

    const onMutation = useEffectEvent(callback);

    const optionsKey = JSON.stringify(options);

    const ref = useCallback(
        (node: Element | null) => {
            // отсоединяем предыдущий observer
            observerRef.current?.disconnect();

            if (!node) return;

            if (!observerRef.current) {
                observerRef.current = new MutationObserver(onMutation);
            }

            observerRef.current.observe(node, options);
        },
        [onMutation, optionsKey]
    );

    useEffect(() => {
        return () => observerRef.current?.disconnect();
    }, []);

    return ref;
}

export function rafThrottle<T extends unknown[]>(
    callback: (...args: T) => void
) {
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
}

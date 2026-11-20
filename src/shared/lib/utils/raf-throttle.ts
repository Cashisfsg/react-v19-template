/**
 * Runs `callback` at most once a frame, with the arguments of the first call
 * in that frame: for scroll, resize and pointer moves, which fire faster
 * than the screen redraws.
 *
 * `cancel` drops the call waiting for the next frame and leaves the function
 * usable, so a component can cancel it on unmount.
 */
export const rafThrottle = <T extends unknown[]>(
    callback: (...args: T) => void
) => {
    let rafId: number | null = null;

    const throttled = (...args: T) => {
        if (rafId !== null) return;

        rafId = requestAnimationFrame(() => {
            rafId = null;
            callback(...args);
        });
    };

    throttled.cancel = () => {
        if (rafId === null) return;

        cancelAnimationFrame(rafId);
        rafId = null;
    };

    return throttled;
};

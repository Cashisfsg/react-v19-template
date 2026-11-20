/**
 * Runs `callback` once the calls stop coming for `ms`.
 *
 * `cancel` is what makes it safe to hold in a component: a pending call has to
 * be dropped when the component goes away, or it fires into a tree that is no
 * longer there.
 */
export const debounce = <T extends unknown[]>(
    callback: (...args: T) => void,
    ms: number
) => {
    /* Not `number`: on the server and in tests `setTimeout` is Node's, and
       hands back an object. */
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const debounced = (...args: T) => {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            timeoutId = null;
            callback(...args);
        }, ms);
    };

    debounced.cancel = () => {
        if (timeoutId === null) return;

        clearTimeout(timeoutId);
        timeoutId = null;
    };

    return debounced;
};

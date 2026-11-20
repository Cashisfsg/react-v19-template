export function debounce<T extends unknown[]>(
    callback: (...args: T) => void,
    timeout: number
) {
    let timeoutId: NodeJS.Timeout | null = null;

    function debounced(...args: T) {
        if (typeof timeoutId === "number") {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            timeoutId = null;
            callback(...args);
        }, timeout);
    }

    debounced.cancel = () => {
        if (typeof timeoutId !== "number") {
            return;
        }

        clearTimeout(timeoutId);
    };

    return debounced;
}

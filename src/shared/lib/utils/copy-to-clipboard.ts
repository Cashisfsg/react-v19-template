export const copyToClipboard = async (
    message: string,
    onSuccessCallback: (() => void) | undefined,
    onErrorCallback: ((error: Error) => void) | undefined
) => {
    try {
        await navigator.clipboard.writeText(String(message));
        onSuccessCallback?.();
    } catch (error) {
        if (error instanceof Error) {
            onErrorCallback?.(error);
        }
    }
};

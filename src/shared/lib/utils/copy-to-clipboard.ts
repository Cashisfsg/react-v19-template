interface CopyToClipboardOptions {
    message: string;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

export const copyToClipboard = async ({
    message,
    onSuccess,
    onError
}: CopyToClipboardOptions) => {
    try {
        await navigator.clipboard.writeText(message);
        onSuccess?.();
    } catch (error) {
        // Whatever was thrown, the caller hears about it: outside a secure
        // context `navigator.clipboard` is undefined and the call throws a
        // TypeError, and a denied permission rejects with a DOMException.
        onError?.(error instanceof Error ? error : new Error(String(error)));
    }
};

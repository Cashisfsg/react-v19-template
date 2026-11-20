import { createPortal } from "react-dom";

import { useHydrationStatus } from "~/shared/lib/hooks/use-hydration-status";

export interface PortalProps extends React.PropsWithChildren {
    /** Where the children go. Defaults to `document.body`. */
    container?: Element | DocumentFragment;
}

/**
 * Renders its children into another part of the document.
 *
 * Nothing renders on the server or during hydration: a portal needs a DOM
 * node, and the server has none. The children appear right after hydration,
 * so they are not in the server HTML, which suits overlays that start closed.
 *
 * `<dialog>` and popovers do not need it: the browser draws them in the top
 * layer, above every z-index and outside any `overflow`.
 */
export const Portal: React.FC<PortalProps> = ({ container, children }) => {
    const isHydrated = useHydrationStatus();

    if (!isHydrated) return null;

    // Read at render, not at import: the module is also loaded on the server,
    // where `document` does not exist.
    const target = container ?? document.body;

    // Untyped callers can still pass null, and `document.body` is null before
    // <body> is parsed. Rendering nothing would hide the mistake.
    if (!(target instanceof Node)) {
        throw new Error(
            "[Portal]: the container element was not found. Pass an element that is in the document, or render after <body> exists."
        );
    }

    return createPortal(children, target);
};

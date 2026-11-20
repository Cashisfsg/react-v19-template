import { createContext, use } from "react";

interface AnchorContextType {
    /**
     * The anchor name this instance binds by, minted per `Anchor.Root`.
     *
     * Two elements sharing one `anchor-name` is not an error — every panel
     * binds to the last one in document order — so a list of instances would
     * silently stack every panel on the final row's anchor.
     */
    name: string;
}

export const AnchorContext = createContext<AnchorContextType | null>(null);

export const useAnchorContext = () => {
    const context = use(AnchorContext);

    if (!context) {
        throw new Error(
            "Anchor compound components must be rendered within the Anchor.Root component"
        );
    }

    return context;
};

import { createContext, use } from "react";

export type TooltipContextType = {
    tooltipId: string;
    tooltipRef: React.RefObject<HTMLElement | null>;
    /** Shows the tooltip after the open delay. */
    show: () => void;
    /** Hides it after the close delay, so the pointer can cross onto it. */
    hide: () => void;
    hideNow: () => void;
    /** Drops a pending show or hide. */
    cancel: () => void;
    onDocumentKeyDown: (event: KeyboardEvent) => void;
};

export const TooltipContext = createContext<TooltipContextType | null>(null);

export const useTooltipContext = () => {
    const context = use(TooltipContext);

    if (!context) {
        throw new Error(
            "Tooltip compound components must be used within <Tooltip.Root />"
        );
    }

    return context;
};

import { createContext, use } from "react";

export const TooltipContext = createContext<{
    tooltipId: string;
    tooltipRef: React.RefObject<HTMLDivElement | null>;
    timeoutRef: React.RefObject<NodeJS.Timeout | undefined>;
    showTooltip: (delay?: number) => void;
    hideTooltip: (delay?: number) => void;
} | null>(null);

export const useTooltipContext = () => {
    const context = use(TooltipContext);

    if (!context) {
        throw new Error(
            "Component must be rendered as child of Tooltip component"
        );
    }

    return context;
};

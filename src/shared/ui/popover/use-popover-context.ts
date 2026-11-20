import { createContext, use } from "react";

interface PopoverContextType {
    popoverId: string;
    popoverRef: React.RefObject<HTMLElement | null>;
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PopoverContext = createContext<PopoverContextType | null>(null);

export const usePopoverContext = () => {
    const context = use(PopoverContext);

    if (!context) {
        throw new Error(
            "Popover compound components must be rendered within the Popover.Root component"
        );
    }

    return context;
};

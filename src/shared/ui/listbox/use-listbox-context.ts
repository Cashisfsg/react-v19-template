import { createContext, use } from "react";

export const ListboxContext = createContext<{
    optionsRef: React.RefObject<Map<string, HTMLLIElement>>;
    optionsArrayRef: React.RefObject<React.RefObject<HTMLLIElement>[]>;
} | null>(null);

export const useListboxContext = () => {
    const context = use(ListboxContext);

    if (!context) {
        throw new Error(
            "Component must be rendered as child of Dialog component"
        );
    }

    return context;
};

import { createContext, use } from "react";

export const AccordionContext = createContext<{ name: string } | null>(null);

export const useAccordionContext = () => {
    const context = use(AccordionContext);

    if (!context)
        throw new Error(
            "Component must be rendered as child of Accordion component"
        );

    return context;
};

import { createContext, use } from "react";

export interface AccordionContextType {
    /** Shared by every item of a `single` accordion, which is what makes them
        exclusive; absent for `multiple`. */
    name: string | undefined;
}

export const AccordionContext = createContext<AccordionContextType | null>(
    null
);

export const useAccordionContext = (): AccordionContextType => {
    const context = use(AccordionContext);

    if (!context) {
        throw new Error(
            "Accordion compound components must be rendered within the Accordion.Root component"
        );
    }

    return context;
};

import { createContext, use } from "react";

export const SectionContext = createContext<{
    rootElement: string;
    ariaLabels: Set<string>;
    ariaDescriptions: Set<string>;
} | null>(null);

export const useSectionContext = () => {
    const context = use(SectionContext);

    if (!context) {
        throw new Error(
            "Component must be rendered as child of Section component"
        );
    }

    return context;
};

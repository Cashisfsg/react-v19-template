import { createContext, use } from "react";

export type SectionPart = "label" | "description";

export const PART_ATTRIBUTE: Record<SectionPart, string> = {
    label: "aria-labelledby",
    description: "aria-describedby"
};

export interface SectionContextValue {
    /** The Root's tag, so a part's id says which element it belongs to. */
    rootElement: string;
    /**
     * Announces a part's id and its element to the Root, and returns the undo.
     *
     * The element is what lets the Root put the ids in document order; the part
     * has it anyway, since this is called from a ref.
     *
     * The lists themselves stay inside the Root: they are built by its hooks,
     * and whoever builds a value is the one allowed to change it — a part
     * reaching in to push its own id is exactly what `react-hooks/immutability`
     * refuses, and it is right to, since nothing outside would know when the
     * Root has to write the attribute again.
     */
    register: (part: SectionPart, id: string, element: Element) => () => void;
}

export const SectionContext = createContext<SectionContextValue | null>(null);

export const useSectionContext = (): SectionContextValue => {
    const context = use(SectionContext);

    if (!context) {
        throw new Error("Section parts must be used within <Section.Root />");
    }

    return context;
};

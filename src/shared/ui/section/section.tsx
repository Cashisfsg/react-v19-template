import { useId, useMemo, useRef } from "react";

import { composeRefs } from "~/shared/lib/utils/compose-refs";

import { SectionContext, useSectionContext } from "./use-section-context";

type ElementProps<E extends React.ElementType = React.ElementType> = { as?: E };

export type RootProps<E extends React.ElementType> = ElementProps<E> &
    Omit<React.ComponentProps<E>, keyof ElementProps>;

export const Root = <E extends React.ElementType = "section">({
    as,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    ref,
    ...props
}: RootProps<E>) => {
    const Tag = as || "section";
    const ariaLabels = useRef<Set<string>>(new Set());
    const ariaDescriptions = useRef<Set<string>>(new Set());

    const contextValue = useMemo(
        () => ({
            ariaLabels: ariaLabels.current,
            ariaDescriptions: ariaDescriptions.current,
            rootElement: Tag.toString()
        }),
        [Tag]
    );

    const callbackRef = (node: HTMLElement | null) => {
        if (node === null) {
            ariaLabels.current.clear();
            ariaDescriptions.current.clear();
            return;
        }

        if (ariaLabels.current.size !== 0 || ariaLabelledBy !== undefined)
            node.setAttribute(
                "aria-labelledby",
                `${Array.from(ariaLabels.current).join(" ")} ${ariaLabelledBy || ""}`.trim()
            );

        if (
            ariaDescriptions.current.size !== 0 ||
            ariaDescribedBy !== undefined
        )
            node.setAttribute(
                "aria-describedby",
                `${Array.from(ariaDescriptions.current).join(" ")} ${ariaDescribedBy || ""}`.trim()
            );
    };

    return (
        <SectionContext value={contextValue}>
            <Tag
                {...props}
                ref={composeRefs(callbackRef, ref)}
            />
        </SectionContext>
    );
};

Root.displayName = "Section.Root";

type LabelProps<E extends React.ElementType> = ElementProps<E> &
    Omit<React.ComponentProps<E>, keyof ElementProps | "id">;

export const Label = <E extends React.ElementType = "h1">({
    as,
    ref,
    ...props
}: LabelProps<E>) => {
    const Tag = as || "h1";
    const { ariaLabels, rootElement } = useSectionContext();
    const labelId = `${rootElement}-label-${useId()}`;

    const callbackRef = () => {
        ariaLabels.add(labelId);
    };

    return (
        <Tag
            {...props}
            id={labelId}
            ref={composeRefs(callbackRef, ref)}
        />
    );
};

Label.displayName = "Section.Label";

type DescriptionProps<E extends React.ElementType> = ElementProps<E> &
    Omit<React.ComponentProps<E>, keyof ElementProps | "id">;

export const Description = <E extends React.ElementType = "p">({
    as,
    ref,
    ...props
}: DescriptionProps<E>) => {
    const Tag = as || "p";
    const { ariaDescriptions, rootElement } = useSectionContext();
    const descriptionId = `${rootElement}-description-${useId()}`;

    const callbackRef = () => {
        ariaDescriptions.add(descriptionId);
    };

    return (
        <Tag
            {...props}
            id={descriptionId}
            ref={composeRefs(callbackRef, ref)}
        />
    );
};

Description.displayName = "Section.Description";

import { useId, useMemo, useRef } from "react";
import { SectionContext, useSectionContext } from "./use-section-context";

type ElementProps<E extends React.ElementType = React.ElementType> = { as?: E };

type RootProps<E extends React.ElementType> = ElementProps<E> &
    Omit<React.ComponentProps<E>, keyof ElementProps | "aria-describedby">;

export const Root = <E extends React.ElementType = "section">({
    as,
    "aria-labelledby": ariaLabelledBy = "",
    ...props
}: RootProps<E>) => {
    const Tag = as || "section";
    const descriptionId = `${Tag.toString()}-description-${useId()}`;
    const ariaLabels = useRef<string[]>([]);

    const contextValue = useMemo(
        () => ({
            ariaLabels: ariaLabels.current,
            descriptionId,
            rootElement: Tag.toString()
        }),
        [descriptionId, Tag]
    );

    return (
        <SectionContext value={contextValue}>
            <Tag
                {...props}
                aria-describedby={descriptionId}
                ref={node => {
                    if (node === null) {
                        ariaLabels.current.length = 0;
                        return;
                    }

                    node?.setAttribute(
                        "aria-labelledby",
                        `${Array.from(ariaLabels.current).join(" ")} ${ariaLabelledBy}`.trim()
                    );
                }}
            />
        </SectionContext>
    );
};

Root.displayName = "Section.Root";

type LabelProps<E extends React.ElementType> = ElementProps<E> &
    Omit<React.ComponentProps<E>, keyof ElementProps | "id">;

export const Label = <E extends React.ElementType = "h1">({
    as,
    ...props
}: LabelProps<E>) => {
    const Tag = as || "h1";
    const { ariaLabels, rootElement } = useSectionContext();
    const labelId = `${rootElement}-label-${useId()}`;

    return (
        <Tag
            {...props}
            id={labelId}
            ref={() => {
                ariaLabels.push(labelId);
            }}
        />
    );
};

Label.displayName = "Section.Label";

type DescriptionProps<E extends React.ElementType> = ElementProps<E> &
    Omit<React.ComponentProps<E>, keyof ElementProps | "id">;

export const Description = <E extends React.ElementType = "p">({
    as,
    ...props
}: DescriptionProps<E>) => {
    const Tag = as || "p";
    const { descriptionId } = useSectionContext();

    return (
        <Tag
            {...props}
            id={descriptionId}
        />
    );
};

Description.displayName = "Section.Description";

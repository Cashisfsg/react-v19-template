import { useId, useMemo } from "react";
import { AccordionContext, useAccordionContext } from "./accordion-context";
import styles from "./Accordion.module.css";

interface RootProps extends React.PropsWithChildren {}

export const Root: React.FC<RootProps> = ({ children }) => {
    const accordionName = `accordion-${useId()}`;

    const contextValue = useMemo(
        () => ({
            name: accordionName
        }),
        [accordionName]
    );

    return <AccordionContext value={contextValue}>{children}</AccordionContext>;
};

Root.displayName = "Accordion.Root";

interface ItemProps extends Omit<React.ComponentProps<"details">, "name"> {}

export const Item: React.FC<ItemProps> = ({ className = "", ...props }) => {
    const { name } = useAccordionContext();

    return (
        <details
            {...props}
            name={name}
            className={`${styles.accordion} ${className}`.trim()}
        />
    );
};

Item.displayName = "Accordion.Item";

interface TriggerProps extends React.ComponentProps<"summary"> {}

export const Trigger: React.FC<TriggerProps> = props => {
    return <summary {...props} />;
};

Trigger.displayName = "Accordion.Trigger";

type ElementProps<E extends React.ElementType = React.ElementType> = { as?: E };

type ContentProps<E extends React.ElementType> = ElementProps<E> &
    Omit<React.ComponentProps<E>, keyof ElementProps | "name">;

export const Content = <E extends React.ElementType = "p">({
    as,
    ...props
}: ContentProps<E>) => {
    const Tag = as || "p";

    return <Tag {...props} />;
};

Content.displayName = "Accordion.Content";

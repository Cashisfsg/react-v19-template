import { useId, useMemo } from "react";

import { AccordionContext, useAccordionContext } from "./use-accordion-context";

import styles from "./accordion.module.css";

/** `single`: opening an item closes the open one. `multiple`: each opens on its own. */
export type AccordionType = "single" | "multiple";

interface RootProps extends React.PropsWithChildren {
    type?: AccordionType;
}

/**
 * A group of disclosures: at most one of them open by default, any number with
 * `type="multiple"`.
 *
 * Built on `<details>` rather than on state: keyboard, screen readers and
 * in-page find already know it, and `name` makes a set of them exclusive
 * without script.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details#name
 *
 * The name is generated so two accordions on one screen cannot close each
 * other's panels. It renders no element: `name` groups the items wherever they
 * sit, so a box around them would be layout nobody asked for.
 */
export const Root: React.FC<RootProps> = ({ type = "single", children }) => {
    const id = useId();
    const value = useMemo(
        () => ({ name: type === "single" ? `accordion-${id}` : undefined }),
        [type, id]
    );

    return <AccordionContext value={value}>{children}</AccordionContext>;
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

/**
 * What opens the item. A `summary` must be the first child of its `details`,
 * so this is not interchangeable with the content below it.
 */
export const Trigger: React.FC<TriggerProps> = props => <summary {...props} />;

Trigger.displayName = "Accordion.Trigger";

type AsProp<E extends React.ElementType> = { as?: E };

type ContentProps<E extends React.ElementType> = AsProp<E> &
    Omit<React.ComponentProps<E>, keyof AsProp<E> | "name">;

/**
 * The panel the trigger reveals. Polymorphic because what it holds decides its
 * element: a form is a `form`, a list is a `ul`.
 */
export const Content = <E extends React.ElementType = "div">({
    as,
    ...props
}: ContentProps<E>) => {
    const Component = as ?? "div";

    return <Component {...props} />;
};

Content.displayName = "Accordion.Content";

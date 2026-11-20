import { useId, useMemo } from "react";

import type { PolymorphicProps } from "~/shared/lib/types/polymorphic";
import { composeEventHandlers } from "~/shared/lib/utils/compose-event-handlers";

import { AnchorContext, useAnchorContext } from "./use-anchor-context";
import {
    type AnchorPlacement,
    useAnchorPlacement
} from "./use-anchor-placement";

import styles from "./anchor.module.css";

/**
 * One element hung off another: a panel under the control that opens it.
 *
 * A panel in the top layer has no containing block to be absolute within, so it
 * cannot be placed by its trigger's position the usual way. Where the engine
 * has CSS anchor positioning the browser places it; where it does not, the
 * panel is given coordinates and follows its anchor while it is open. Which of
 * the two is decided once per open, in JS, and handed to the styles as
 * `data-anchor`, so CSS and JS cannot disagree about it.
 *
 * Renders nothing of its own: the parts are whatever elements the caller
 * already has, through `as`.
 */
export const Root: React.FC<React.PropsWithChildren> = ({ children }) => {
    const generatedId = useId();
    const value = useMemo(
        () => ({ name: `--anchor-${generatedId}` }),
        [generatedId]
    );

    return <AnchorContext value={value}>{children}</AnchorContext>;
};

Root.displayName = "Anchor.Root";

interface StyleProps {
    className?: string | undefined;
    style?: React.CSSProperties | undefined;
}

type TargetProps<E extends React.ElementType> = PolymorphicProps<E, StyleProps>;

/**
 * What the panel hangs on. `data-anchor-target` is how the fallback finds it,
 * so neither a ref nor an id of ours is needed and the caller keeps its own id.
 */
export const Target = <E extends React.ElementType = "button">({
    as,
    className = "",
    style,
    ...props
}: TargetProps<E>) => {
    const { name } = useAnchorContext();
    const Tag = as ?? "button";

    return (
        <Tag
            {...props}
            data-anchor-target={name}
            style={{ "--anchor-name": name, ...style } as React.CSSProperties}
            className={`${styles.target} ${className}`.trim()}
        />
    );
};

Target.displayName = "Anchor.Target";

interface PositionedOwnProps extends StyleProps {
    /**
     * Where the panel goes by its anchor. Anchored under it and lined up with
     * its inline end unless stated; `false` leaves the panel where its own
     * styles put it.
     */
    placement?: AnchorPlacement | false | undefined;
    onBeforeToggle?: React.ToggleEventHandler<HTMLElement> | undefined;
}

type PositionedProps<E extends React.ElementType> = PolymorphicProps<
    E,
    PositionedOwnProps
>;

/** The panel. Placed on every open, before it shows. */
export const Positioned = <E extends React.ElementType = "div">({
    as,
    placement = {},
    className = "",
    style,
    onBeforeToggle,
    ...props
}: PositionedProps<E>) => {
    const { name } = useAnchorContext();
    const place = useAnchorPlacement(placement, name);
    const Tag = as ?? "div";

    return (
        <Tag
            {...props}
            style={{ "--anchor-name": name, ...style } as React.CSSProperties}
            className={`${styles.positioned} ${className}`.trim()}
            onBeforeToggle={composeEventHandlers(onBeforeToggle, place)}
        />
    );
};

Positioned.displayName = "Anchor.Positioned";

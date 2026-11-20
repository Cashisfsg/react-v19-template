import { cloneElement } from "react";

import styles from "./marquee.module.css";

/** WAI-ARIA 1.2 requires `marquee` to have an accessible name. */
type NameProps =
    | { "aria-label": string; "aria-labelledby"?: never }
    | { "aria-labelledby": string; "aria-label"?: never };

type RootProps = Omit<
    React.ComponentProps<"div">,
    "role" | "children" | "aria-label" | "aria-labelledby"
> &
    NameProps & {
        children: React.ReactElement<ListProps>;
        /** Stops the scrolling. WCAG 2.2.2 asks for a way to pause motion that
            starts by itself and lasts over five seconds; pausing on hover or
            focus alone does not count, so give the reader a control. */
        paused?: boolean;
    };

/**
 * A strip that scrolls its list endlessly: stock tickers and ad banners, as
 * ARIA describes the role. Its implicit aria-live is off, so the motion is not
 * announced.
 *
 * The list is rendered twice so the loop has no seam. The copy is `inert`:
 * aria-hidden alone would hide it from screen readers but leave its links in
 * the tab order, which MDN says not to do.
 */
export const Root: React.FC<RootProps> = ({
    className = "",
    children,
    paused = false,
    ...props
}) => (
    <div
        {...props}
        role="marquee"
        data-paused={paused || undefined}
        className={`${styles.marquee} ${className}`.trim()}
    >
        {children}
        {cloneElement(children, { inert: true, "aria-hidden": true })}
    </div>
);

Root.displayName = "Marquee.Root";

interface ListProps extends React.ComponentProps<"ul"> {}

export const List: React.FC<ListProps> = ({ className = "", ...props }) => (
    <ul
        {...props}
        className={`${styles["marquee-list"]} ${className}`.trim()}
    />
);

List.displayName = "Marquee.List";

interface ItemProps extends React.ComponentProps<"li"> {}

export const Item: React.FC<ItemProps> = props => <li {...props} />;

Item.displayName = "Marquee.Item";

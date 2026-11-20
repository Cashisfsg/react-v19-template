import { Children, useEffect, useId, useRef, useState } from "react";

import type { PolymorphicProps } from "~/shared/lib/types/polymorphic";
import { composeEventHandlers } from "~/shared/lib/utils/compose-event-handlers";

import {
    CURRENT_SELECTOR,
    ITEM_SELECTOR,
    parentItem,
    restTabStop,
    setTabStop,
    shownItems
} from "./tree-dom";

import styles from "./navigation-treeview.module.css";

interface RootProps extends Omit<
    React.ComponentProps<"ul">,
    "role" | "aria-label" | "aria-labelledby"
> {
    /** Names the navigation landmark and the tree alike, as the APG example
        does. */
    "aria-label": string;
}

/**
 * Site navigation as a tree of links, after the WAI-ARIA navigation treeview
 * example: a `<nav>` around a `<ul role="tree">` whose items are the links
 * themselves.
 *
 * **Focus is real.** Unlike `Menu`, the arrows move DOM focus from link to
 * link: a link has to hold focus for Enter to follow it natively, and that is
 * what the example does. The tree is one tab stop, the current page's link,
 * and it follows the focus while the focus is inside.
 *
 * Down and Up move through the shown links, Right opens a section or steps
 * into it, Left closes it or steps out to its parent, Home and End jump, a
 * letter finds the next link starting with it. Enter and Space follow the
 * link. The ancestors of the current page open on load.
 *
 * https://www.w3.org/WAI/ARIA/apg/patterns/treeview/examples/treeview-navigation/
 */
export const Root: React.FC<RootProps> = ({
    "aria-label": label,
    className = "",
    onFocus,
    onBlur,
    ...props
}) => {
    const treeRef = useRef<HTMLUListElement>(null);

    /* After every render, so a new current page becomes the tab stop. Not
       while the focus is inside, where the stop is the focused link. */
    useEffect(() => {
        const tree = treeRef.current;
        if (tree !== null && !tree.contains(document.activeElement)) {
            restTabStop(tree);
        }
    });

    const onFocusHandler: React.FocusEventHandler<HTMLUListElement> = event => {
        if (event.target.matches(ITEM_SELECTOR)) {
            setTabStop(event.currentTarget, event.target);
        }
    };

    /* Tab brings a reader back to the current page, not to wherever they
       were last in the tree. */
    const onBlurHandler: React.FocusEventHandler<HTMLUListElement> = event => {
        const tree = event.currentTarget;
        if (
            !(event.relatedTarget instanceof Node) ||
            !tree.contains(event.relatedTarget)
        ) {
            restTabStop(tree);
        }
    };

    return (
        <nav
            aria-label={label}
            className={className || undefined}
        >
            <ul
                {...props}
                role="tree"
                aria-label={label}
                className={styles.tree}
                onFocus={composeEventHandlers(onFocus, onFocusHandler)}
                onBlur={composeEventHandlers(onBlur, onBlurHandler)}
                ref={treeRef}
            />
        </nav>
    );
};

Root.displayName = "NavigationTreeview.Root";

interface ItemOwnProps {
    /** The link's text, which type-ahead matches too. */
    label: React.ReactNode;
    /** The items one level down. With any, this item opens and closes. */
    children?: React.ReactNode;
    /** Marks this link as the page being shown. A router's own `NavLink`
        sets `aria-current` itself, and is read just the same. */
    current?: boolean | undefined;
    /** Open on first render. The ancestors of the current page open anyway. */
    defaultExpanded?: boolean | undefined;
    className?: string | undefined;
    onKeyDown?: React.KeyboardEventHandler<HTMLElement> | undefined;
}

type ItemProps<E extends React.ElementType> = PolymorphicProps<
    E,
    ItemOwnProps,
    "role" | "tabIndex" | "aria-expanded" | "aria-owns" | "aria-current"
>;

/**
 * One link of the tree, and the group of links under it when it has
 * children. A link by default; pass a router's `Link` or `NavLink` through
 * `as`.
 *
 * The link is the `treeitem`, inside an `<li role="none">`, and its group is
 * the link's sibling, so `aria-owns` ties the two together. A press on the
 * link follows it; the arrow before the text opens and closes the section,
 * for the pointer only, since Right and Left do the same from the keyboard.
 */
export const Item = <E extends React.ElementType = "a">({
    as,
    label,
    children,
    current = false,
    defaultExpanded = false,
    className = "",
    onKeyDown,
    ...props
}: ItemProps<E>) => {
    const Tag: React.ElementType = as ?? "a";
    const groupId = `navigation-treeview-group-${useId()}`;
    const groupRef = useRef<HTMLUListElement>(null);
    const nodeRef = useRef<HTMLLIElement>(null);
    /* `toArray` drops the `null` and `false` a condition leaves behind;
       `count` would take them for items. */
    const isParent = Children.toArray(children).length > 0;
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    /* The current page is known only once the links are in the DOM: a
       `NavLink` decides it itself. Once, on mount; after that, opening and
       closing are the reader's. */
    useEffect(() => {
        if (groupRef.current?.querySelector(CURRENT_SELECTOR)) {
            setIsExpanded(true);
        }
    }, []);

    /* Opening or closing shows or hides links the tab stop may be on, or
       should be on: the current page's ancestors open after the root has
       placed the stop. Only while the focus is outside, as at the root. */
    useEffect(() => {
        const tree = nodeRef.current?.closest('[role="tree"]');
        if (tree && !tree.contains(document.activeElement)) restTabStop(tree);
    }, [isExpanded]);

    const focus = (item: HTMLElement | null | undefined) => {
        item?.focus();
    };

    const findByLetter = (link: HTMLElement, tree: Element, key: string) => {
        const items = shownItems(tree);
        const from = items.indexOf(link) + 1;
        const order = [...items.slice(from), ...items.slice(0, from)];
        const letter = key.toLocaleLowerCase();
        return order.find(item =>
            item.textContent.trim().toLocaleLowerCase().startsWith(letter)
        );
    };

    const handleKeyDown: React.KeyboardEventHandler<HTMLElement> = event => {
        if (event.altKey || event.ctrlKey || event.metaKey) return;

        const link = event.currentTarget;
        const tree = link.closest('[role="tree"]');
        if (tree === null) return;

        const items = shownItems(tree);
        const at = items.indexOf(link);

        switch (event.key) {
            case "ArrowDown":
                focus(items[at + 1]);
                break;
            case "ArrowUp":
                focus(at > 0 ? items[at - 1] : undefined);
                break;
            case "Home":
                focus(items[0]);
                break;
            case "End":
                focus(items.at(-1));
                break;
            case "ArrowRight":
                if (!isParent) return;
                if (isExpanded) {
                    focus(
                        groupRef.current?.querySelector<HTMLElement>(
                            ITEM_SELECTOR
                        )
                    );
                } else {
                    setIsExpanded(true);
                }
                break;
            case "ArrowLeft":
                if (isParent && isExpanded) {
                    setIsExpanded(false);
                } else {
                    focus(parentItem(link));
                }
                break;
            /* Enter is the link's own. Space scrolls the page on a link, so
               it is made to follow it, as the example's table asks. */
            case " ":
                link.click();
                break;
            default: {
                if (event.key.length !== 1) return;
                const match = findByLetter(link, tree, event.key);
                if (match === undefined) return;
                focus(match);
            }
        }

        event.preventDefault();
    };

    /* On the arrow only: the press must neither follow the link nor reach a
       handler of the caller's on it. */
    const handleToggle: React.MouseEventHandler<HTMLSpanElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        setIsExpanded(expanded => !expanded);
    };

    return (
        <li
            role="none"
            ref={nodeRef}
        >
            <Tag
                {...props}
                role="treeitem"
                aria-expanded={isParent ? isExpanded : undefined}
                aria-owns={isParent ? groupId : undefined}
                aria-current={current ? "page" : undefined}
                className={`${styles.item} ${className}`.trim()}
                // eslint-disable-next-line react-hooks/refs -- composeEventHandlers only invokes handleKeyDown on a key press, not during render
                onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
            >
                {isParent ? (
                    <span
                        aria-hidden="true"
                        className={styles.toggle}
                        onClick={handleToggle}
                    />
                ) : (
                    <span
                        aria-hidden="true"
                        className={styles.spacer}
                    />
                )}
                <span className={styles.label}>{label}</span>
            </Tag>
            {isParent && (
                <ul
                    id={groupId}
                    role="group"
                    hidden={!isExpanded}
                    className={styles.group}
                    ref={groupRef}
                >
                    {children}
                </ul>
            )}
        </li>
    );
};

Item.displayName = "NavigationTreeview.Item";

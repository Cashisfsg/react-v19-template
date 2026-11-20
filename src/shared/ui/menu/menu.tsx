import { use, useEffect, useId, useMemo, useRef } from "react";

import { Popover, usePopoverContext } from "~/shared/ui/popover";

import { useListNavigation } from "~/shared/lib/hooks/use-list-navigation";
import { composeEventHandlers } from "~/shared/lib/utils/compose-event-handlers";
import { composeRefs } from "~/shared/lib/utils/compose-refs";

import {
    MenuContext,
    MenuGroupContext,
    MenuSheetContext,
    useMenuContext,
    useMenuGroupLabelId,
    type OpenFocus
} from "./use-menu-context";

import styles from "./menu.module.css";

/* What `useListNavigation` marks an item with; only items carry it. */
const ITEM_SELECTOR = "[data-list-item]";

const menuItems = (menu: HTMLElement): HTMLElement[] =>
    Array.from(menu.querySelectorAll<HTMLElement>(ITEM_SELECTOR));

/* A control that refuses through `aria-disabled` stays a stop for the arrow
   keys, as the pattern asks, but Enter and Space do nothing on it. */
const isRefused = (item: HTMLElement) =>
    item.getAttribute("aria-disabled") === "true";

interface RootProps extends React.PropsWithChildren {
    /**
     * What the menu's own id starts with, the rest being generated. One value,
     * not two: it is the panel's `id` and what the trigger's `popovertarget`
     * points at, so it belongs to the pair rather than to either part.
     */
    id?: string | undefined;
    /** What the trigger's id starts with, the rest being generated. That id
        names a menu with no title. */
    triggerId?: string | undefined;
}

/**
 * A menu button and its menu, as the WAI-ARIA pattern describes them.
 *
 * Built on `shared/ui/popover`: the top layer, the tap outside and the reveal
 * of the contents are its. What this adds is what makes a panel of buttons a
 * *menu* — the list markup, the active item, the keys and the name.
 *
 * **The focus is visual.** DOM focus goes to the `<menu>` when it opens and
 * stays there; the active item is named by `aria-activedescendant` and marked
 * with `data-active`, as in the APG's activedescendant example, through
 * `useListNavigation`. Nothing calls `.focus()` on an item, so moving through
 * the menu re-renders nothing and no item has to be focusable.
 *
 * Carries no words, colours or icons of its own: every text and mark comes
 * from the caller, and the look from the `--menu-*` custom properties, which
 * all have neutral defaults.
 *
 * https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/examples/menu-button-actions-active-descendant/
 */
export const Root: React.FC<RootProps> = ({ id, triggerId, children }) => (
    <Popover.Root id={id}>
        <MenuProvider triggerId={triggerId}>{children}</MenuProvider>
    </Popover.Root>
);

Root.displayName = "Menu.Root";

const MenuProvider: React.FC<Pick<RootProps, "triggerId" | "children">> = ({
    triggerId,
    children
}) => {
    const { popoverRef, isOpen } = usePopoverContext();
    const generatedId = useId();
    const openFocusRef = useRef<OpenFocus | null>(null);
    // Up and Down wrap at both ends, as the menu pattern asks.
    const navigation = useListNavigation({ loop: true });

    const value = {
        triggerId: `${triggerId ?? "menu-trigger"}-${generatedId}`,
        titleId: `menu-title-${generatedId}`,
        menuRef: popoverRef,
        isOpen,
        openFocusRef,
        navigation
    };

    return <MenuContext value={value}>{children}</MenuContext>;
};

interface TriggerProps extends Omit<
    React.ComponentProps<typeof Popover.Trigger>,
    "id" | "popoverTargetAction" | "aria-haspopup"
> {}

/**
 * The button the menu hangs from, and the anchor it hangs on.
 *
 * The press is the platform's. Down and Up are ours: they open the menu on its
 * first and last item, the keyboard half of the pattern.
 */
export const Trigger: React.FC<TriggerProps> = ({
    onClick,
    onKeyDown,
    ...props
}) => {
    const { triggerId, isOpen, openFocusRef } = useMenuContext();

    const onClickHandler: React.MouseEventHandler<
        HTMLButtonElement
    > = event => {
        /* Safari does not focus a clicked button, and the popover gives focus
           back to whatever held it when it opened. Before the open, which
           follows this event. */
        event.currentTarget.focus();
        /* Two quick presses open and shut the panel before it reports either,
           so the note of the first would outlive them and mislead the next
           open. */
        openFocusRef.current = null;
    };

    const onKeyDownHandler: React.KeyboardEventHandler<
        HTMLButtonElement
    > = event => {
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
        /* An open menu has the focus and answers these itself. */
        if (isOpen) return;

        event.preventDefault();
        event.currentTarget.click();
        /* After the click, which clears the note. The open is the platform's
           and there is nothing here to await, so the list's own effect reads
           this. */
        openFocusRef.current = event.key === "ArrowDown" ? "first" : "last";
    };

    return (
        <Popover.Trigger
            {...props}
            id={triggerId}
            /* The panel really is a menu with the keys to match, so the promise
               is kept. `popovertarget` already sets up the `aria-expanded`
               half. */
            aria-haspopup="menu"
            // eslint-disable-next-line react-hooks/refs -- composeEventHandlers only invokes onClickHandler on a press, not during render
            onClick={composeEventHandlers(onClick, onClickHandler)}
            // eslint-disable-next-line react-hooks/refs -- composeEventHandlers only invokes onKeyDownHandler on a key press, not during render
            onKeyDown={composeEventHandlers(onKeyDown, onKeyDownHandler)}
        />
    );
};

Trigger.displayName = "Menu.Trigger";

interface SheetProps extends Omit<
    React.ComponentProps<"section">,
    "id" | "popover"
> {}

/**
 * A bottom sheet on a phone, and on a wide screen a panel under the trigger
 * where the engine anchors natively — a sheet still where it does not.
 *
 * Holds a `Menu.List` and, where wanted, a `Menu.Handle` and a plain `<header>`
 * above it. Only the list scrolls, so the header stays in place. Needs a
 * `Menu.Title`, which names the menu.
 */
export const Sheet: React.FC<SheetProps> = ({
    "aria-labelledby": ariaLabelledBy = "",
    className = "",
    children,
    ...props
}) => {
    const { titleId } = useMenuContext();

    return (
        <Popover.Content
            {...props}
            /* A `section`, so that the `<header>` inside is the sheet's own:
               under no sectioning element it would be the `banner` landmark of
               the whole page. */
            as="section"
            aria-labelledby={`${titleId} ${ariaLabelledBy}`.trim()}
            /* Coordinates would put a phone-sized sheet half off a narrow
               screen, so without the engine's own anchoring it stays a sheet. */
            anchor={{ fallback: false, media: "(width > 36rem)" }}
            className={`${styles.sheet} ${className}`.trim()}
        >
            <MenuSheetContext value={true}>{children}</MenuSheetContext>
        </Popover.Content>
    );
};

Sheet.displayName = "Menu.Sheet";

/** The bar at the top of a sheet. Only drawn: nothing here makes the sheet
    draggable. */
export const Handle: React.FC<
    Omit<React.ComponentProps<"span">, "children" | "aria-hidden">
> = ({ className = "", ...props }) => (
    <span
        {...props}
        aria-hidden="true"
        className={`${styles.handle} ${className}`.trim()}
    />
);

Handle.displayName = "Menu.Handle";

export type TitleTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface TitleProps extends Omit<React.ComponentProps<"h2">, "id"> {
    /** The level that fits the page around the menu. */
    as?: TitleTag;
}

/** The sheet's heading and the menu's name. Stays the name where CSS hides it
    on a wide screen. */
export const Title: React.FC<TitleProps> = ({
    as: Tag = "h2",
    className = "",
    children,
    ...props
}) => {
    const { titleId } = useMenuContext();

    return (
        <Tag
            {...props}
            id={titleId}
            className={`${styles.title} ${className}`.trim()}
        >
            {children}
        </Tag>
    );
};

Title.displayName = "Menu.Title";

/** The sheet's ✕. Its label and icon come from the caller. */
export const Close: React.FC<React.ComponentProps<typeof Popover.Close>> = ({
    className = "",
    ...props
}) => (
    <Popover.Close
        {...props}
        className={`${styles.close} ${className}`.trim()}
    />
);

Close.displayName = "Menu.Close";

interface ListProps extends Omit<
    React.ComponentProps<"menu">,
    "id" | "role" | "tabIndex" | "popover" | "aria-activedescendant"
> {}

/**
 * The menu itself: a real `<menu>`, which is a list, with the keyboard its
 * role promises. On its own it is also the popover; inside a `Menu.Sheet` it
 * is only the list.
 *
 * Up and Down wrap at both ends, Home and End jump, a letter finds an item,
 * Enter and Space press the active one, and Tab leaves by closing the menu.
 * Escape is the popover's own, and so is the focus going back to where it was
 * before the menu opened.
 */
export const List: React.FC<ListProps> = ({
    "aria-labelledby": ariaLabelledBy = "",
    className = "",
    onFocus,
    onKeyDown,
    onPointerDown,
    onMouseDown,
    onClick,
    ref,
    ...props
}) => {
    const { triggerId, titleId, menuRef, isOpen, openFocusRef, navigation } =
        useMenuContext();
    const isInSheet = use(MenuSheetContext);
    const { attachList, setActive, reset, getActiveItem } = navigation;
    /* Held across renders, as the hook asks of its list. */
    const listRef = useMemo(
        () => composeRefs(attachList, ref),
        [attachList, ref]
    );

    /* After the reveal commits, not during the toggle event: the popover's
       Activity keeps the items hidden until then, and an item that is still
       `display: none` cannot be scrolled to. */
    useEffect(() => {
        if (!isOpen) return;
        const panel = menuRef.current;
        if (panel === null) return;

        const wanted = openFocusRef.current;
        openFocusRef.current = null;

        const menu = panel.querySelector<HTMLElement>('[role="menu"]') ?? panel;
        const usable = menuItems(menu).filter(item => !isRefused(item));
        /* A menu of choices opens on the one in force, which is where a reader
           expects to be; a menu of actions has none and opens on the first. */
        const checked = usable.find(
            item => item.getAttribute("aria-checked") === "true"
        );
        const target =
            wanted === "last"
                ? usable.at(-1)
                : wanted === "first"
                  ? usable[0]
                  : (checked ?? usable[0]);

        /* Named before the focus lands, so the menu is announced with its
           active item. With every item refused there is none, and the arrows
           still work on the menu, which is why it takes the focus anyway. */
        if (target === undefined) {
            reset();
        } else {
            setActive(target);
            target.scrollIntoView({ block: "nearest" });
        }
        menu.focus();
    }, [isOpen, menuRef, openFocusRef, setActive, reset]);

    const press = (event: React.KeyboardEvent<HTMLElement>) => {
        event.preventDefault();
        const item = getActiveItem();
        if (item !== null && !isRefused(item)) item.click();
    };

    /* Type-ahead: a letter moves to the next item starting with it, wrapping.
       Modifiers belong to somebody else's shortcut. */
    const findByLetter = (event: React.KeyboardEvent<HTMLElement>) => {
        if (event.key.length !== 1 || event.key === " ") return;
        if (event.ctrlKey || event.metaKey || event.altKey) return;

        const items = menuItems(event.currentTarget);
        const at = items.findIndex(item => item === getActiveItem());
        const key = event.key.toLocaleLowerCase();
        const from = at + 1;
        const order = [...items.slice(from), ...items.slice(0, from)];
        const match = order.find(item =>
            item.textContent.trim().toLocaleLowerCase().startsWith(key)
        );
        if (match === undefined) return;

        event.preventDefault();
        setActive(match);
        match.scrollIntoView({ block: "nearest" });
    };

    const onKeyDownHandler: React.KeyboardEventHandler<HTMLElement> = event => {
        switch (event.key) {
            case "Tab":
                /* Not prevented: the menu closes and the browser carries the
                   Tab on from where the platform put focus back. */
                event.currentTarget
                    .closest<HTMLElement>("[popover]")
                    ?.hidePopover();
                return;
            case "Enter":
            case " ":
                press(event);
                return;
            default:
                findByLetter(event);
                if (!event.defaultPrevented) navigation.onKeyDown(event);
        }
    };

    /* A press would otherwise move DOM focus onto the item's button, away from
       the menu that names the active item. The click still happens. */
    const onMouseDownHandler: React.MouseEventHandler<HTMLElement> = event => {
        if (
            event.target instanceof Element &&
            event.target.closest(ITEM_SELECTOR) !== null
        ) {
            event.preventDefault();
        }
    };

    const listProps = {
        role: "menu",
        tabIndex: -1,
        onFocus: composeEventHandlers(onFocus, navigation.listProps.onFocus),
        onKeyDown: composeEventHandlers(onKeyDown, onKeyDownHandler),
        onPointerDown: composeEventHandlers(
            onPointerDown,
            navigation.listProps.onPointerDown
        ),
        onMouseDown: composeEventHandlers(onMouseDown, onMouseDownHandler),
        onClick: composeEventHandlers(onClick, navigation.listProps.onClick)
    } as const;

    if (isInSheet) {
        return (
            <menu
                {...props}
                {...listProps}
                ref={listRef}
                aria-labelledby={`${titleId} ${ariaLabelledBy}`.trim()}
                className={`${styles.items} ${className}`.trim()}
            />
        );
    }

    return (
        <Popover.Content
            {...props}
            {...listProps}
            ref={listRef}
            as="menu"
            /* The button names the menu: this panel has no heading of its own. */
            aria-labelledby={`${triggerId} ${ariaLabelledBy}`.trim()}
            className={`${styles.list} ${className}`.trim()}
        />
    );
};

List.displayName = "Menu.List";

/**
 * What an item is unless the caller brings its own: a button aimed at the
 * panel. A press closes the menu with nothing to wire, and
 * `popoverTargetAction="show"` keeps it open, because showing a panel already
 * shown does nothing. `toggle` would close it just the same.
 */
const ItemButton: React.FC<React.ComponentProps<typeof Popover.Trigger>> = ({
    popoverTargetAction = "hide",
    ...props
}) => (
    <Popover.Trigger
        {...props}
        /* The button that opened the menu holds the anchor; an item taking it
           would move the panel onto itself. */
        anchor={false}
        popoverTargetAction={popoverTargetAction}
    />
);

/**
 * An item's id and the props that make it one, unless it is natively
 * disabled: that one cannot be pressed at all, so it is no stop for the keys.
 *
 * The ref is held across renders: `useListNavigation` takes the item's name
 * off the menu in its cleanup, and a new callback each render would run that
 * cleanup on the active item at every render.
 */
const useItem = <T extends HTMLElement>(
    id: string | undefined,
    disabled: boolean | undefined,
    ref: React.Ref<T> | undefined
) => {
    const { navigation } = useMenuContext();
    const generatedId = `menu-item-${useId()}`;
    const itemId = id ?? generatedId;
    const { ref: forgetOnUnmount, ...marks } = navigation.getItemProps(itemId);
    const itemRef = useMemo(
        () => composeRefs<T>(forgetOnUnmount, ref),
        [forgetOnUnmount, ref]
    );

    if (disabled === true) return { id: itemId, ref };

    return { ...marks, ref: itemRef };
};

/* Polymorphic because an item may be a control the caller already has — a
   feature's own button, the trigger of a dialog — and all this owes it is the
   `<li>`, the roles and the id the menu names it by. Buttons only, for now: a
   link would need its own way of closing the menu, since `popovertarget`
   works on nothing else. */
type ButtonLike<E extends React.ElementType> =
    React.ComponentProps<E> extends React.ComponentProps<"button"> ? E : never;

interface ItemOwnProps {
    id?: string | undefined;
    disabled?: boolean | undefined;
    className?: string | undefined;
    ref?: React.Ref<HTMLElement> | undefined;
}

type ItemProps<E extends React.ElementType> = {
    as?: E & ButtonLike<E>;
} & ItemOwnProps &
    Omit<
        React.ComponentProps<E>,
        "as" | keyof ItemOwnProps | "role" | "tabIndex" | "aria-expanded"
    >;

/**
 * One action, in the list item the role hierarchy wants. A press closes the
 * menu unless `popoverTargetAction="show"` says otherwise. A caller that closes
 * on its own terms passes its own control through `as`.
 *
 * `role="none"` on the `<li>`: a `<menu>` is a list, and a list item between
 * the menu and its `menuitem` would be a layer the roles do not allow.
 */
export const Item = <E extends React.ElementType = "button">({
    as,
    id,
    disabled,
    className = "",
    ref,
    ...props
}: ItemProps<E>) => {
    const Tag: React.ElementType = as ?? ItemButton;
    const item = useItem(id, disabled, ref);

    return (
        <li role="none">
            <Tag
                {...props}
                {...item}
                disabled={disabled}
                role="menuitem"
                /* A menu item that says it is collapsed reads as a submenu, so
                   one that opens a dialog (`as={Dialog.Trigger}`) states no
                   expanded state. */
                aria-expanded={undefined}
                /* Out of the tab order: the menu is the one stop, and the
                   active item is named rather than focused. */
                tabIndex={-1}
                className={`${styles.item} ${className}`.trim()}
            />
        </li>
    );
};

Item.displayName = "Menu.Item";

interface GroupProps extends Omit<React.ComponentProps<"ul">, "role"> {}

/**
 * A set of items inside the menu, named by a `Menu.GroupLabel` or, where
 * nothing is shown, by `aria-label`. Grouping is all it does: which radio holds
 * in a set is the `checked` its caller passes.
 *
 * A list item with its own list inside, because a `<menu>` may only hold list
 * items.
 */
export const Group: React.FC<GroupProps> = ({
    "aria-labelledby": labelledBy = "",
    className = "",
    children,
    ...props
}) => {
    const generatedId = useId();
    const labelId = `menu-group-label-${generatedId}`;
    const ownName = props["aria-label"] === undefined ? labelId : "";

    return (
        <li role="none">
            <ul
                {...props}
                role="group"
                aria-labelledby={`${ownName} ${labelledBy}`.trim() || undefined}
                className={`${styles.group} ${className}`.trim()}
            >
                <MenuGroupContext value={labelId}>{children}</MenuGroupContext>
            </ul>
        </li>
    );
};

Group.displayName = "Menu.Group";

/**
 * The visible name of the `Menu.Group` around it. Not an item: the arrow keys
 * and the letters pass over it, and a press on it does nothing.
 */
export const GroupLabel: React.FC<
    Omit<React.ComponentProps<"li">, "id" | "role">
> = ({ className = "", ...props }) => {
    const labelId = useMenuGroupLabelId();

    return (
        <li
            {...props}
            id={labelId}
            role="none"
            className={`${styles["group-label"]} ${className}`.trim()}
        />
    );
};

GroupLabel.displayName = "Menu.GroupLabel";

interface RadioItemProps extends Omit<
    React.ComponentProps<typeof Popover.Trigger>,
    "role" | "tabIndex" | "type" | "aria-checked"
> {
    /** Whether this is the choice in force. Exactly one in a set should be. */
    checked: boolean;
}

/**
 * One choice out of a set: an optional mark, the words, and a check drawn when
 * it is in force. The reader is told it is one of several and which one holds,
 * and the menu opens on it next time.
 *
 * A pick closes the menu with Enter and with Space alike, unless
 * `popoverTargetAction="show"` keeps it open for a set up in several passes.
 */
export const RadioItem: React.FC<RadioItemProps> = ({
    checked,
    id,
    disabled,
    className = "",
    ref,
    ...props
}) => {
    const item = useItem(id, disabled, ref);

    return (
        <li role="none">
            <ItemButton
                {...props}
                {...item}
                disabled={disabled}
                role="menuitemradio"
                aria-checked={checked}
                tabIndex={-1}
                className={`${styles.item} ${styles.radio} ${className}`.trim()}
            />
        </li>
    );
};

RadioItem.displayName = "Menu.RadioItem";

/**
 * A rule between groups of actions.
 *
 * The list item carries the role itself — `separator` is allowed as a child of
 * `menu`, so there is nothing to wrap and nothing to hide behind `role="none"`.
 * A reader hears the actions as parted rather than as one run.
 */
export const Separator: React.FC<
    Omit<React.ComponentProps<"li">, "children" | "role">
> = ({ className = "", ...props }) => (
    <li
        {...props}
        role="separator"
        className={`${styles.separator} ${className}`.trim()}
    />
);

Separator.displayName = "Menu.Separator";

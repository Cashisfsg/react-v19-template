import { useCallback, useRef } from "react";

import {
    stepIndex,
    type ListOrientation,
    type StepOptions
} from "./step-index";

/** Marks an item for the list to walk; set by `getItemProps`. */
const ITEM_ATTRIBUTE = "data-list-item";

const itemsOf = (list: HTMLElement): HTMLElement[] =>
    Array.from(list.querySelectorAll<HTMLElement>(`[${ITEM_ATTRIBUTE}]`));

/* The browser scrolls to what is focused, and an item never is: DOM focus stays
   on the list, so keeping the active item in sight is the hook's job. */
const reveal = (item: HTMLElement) => {
    item.scrollIntoView({ block: "nearest", inline: "nearest" });
};

interface UseListNavigationOptions extends StepOptions {
    /** Which arrows move the active item: Up and Down, or Left and Right. */
    orientation?: ListOrientation;
}

/**
 * Keyboard navigation over a list, after the WAI-ARIA Listbox Pattern's keys:
 * the arrows along the orientation move the active item and stop at the ends,
 * Home and End jump to them.
 *
 * **The focus is visual.** DOM focus stays on the list and never moves to an
 * item with `.focus()`. The list names the active item through
 * `aria-activedescendant`, and the hook scrolls it into view and marks it with
 * `data-active` for the caller to style, since `:focus` never matches it.
 *
 * **Nothing re-renders on a move.** The active item lives in a ref, and the
 * hook writes `aria-activedescendant` and `data-active` straight onto the DOM,
 * as the APG example's script does. So neither attribute may be rendered by the
 * caller: the next render would overwrite what the hook wrote.
 *
 * **Roles are the caller's.** The hook knows items and keys, not what they
 * mean: the list's role (`listbox`, `menu`, `tablist`…), the items' roles and
 * states such as `aria-selected`, and the name are set by the widget built on
 * it. `aria-activedescendant` is read only on a composite role, so the list
 * needs one.
 *
 * Every element given `getItemProps` inside the list is an item, however deep:
 * group labels and other markup without them are passed over.
 *
 * **The focus may sit elsewhere.** An editable combobox keeps DOM focus in its
 * input while the items live in the listbox beside it. Such a widget hands the
 * input to `attachFocusHolder`, the listbox to `attachList`, and calls
 * `onKeyDown` from the input's own handler; `listProps` is for a list that
 * holds focus itself. Nothing active is a state of its own there: `reset`
 * returns to it, and from it Down starts at the top and Up at the bottom.
 */
export const useListNavigation = ({
    orientation = "vertical",
    loop = false,
    homeEnd = true
}: UseListNavigationOptions = {}) => {
    const listRef = useRef<HTMLElement | null>(null);
    /* Where `aria-activedescendant` goes when it is not the list. */
    const focusHolderRef = useRef<HTMLElement | null>(null);
    const activeIdRef = useRef<string | null>(null);

    /* A press on an item focuses the list on its way to the click. Picking an
       entry item and scrolling to it then would move the list under the
       pointer, and the click would land on another item. */
    const pointerRef = useRef(false);

    /* A callback rather than the ref object, which would tie the list to one
       element type: this one fits a `ul`, a `menu` or a `div` alike. Held
       across renders, like `forgetOnUnmount`: a new one each render is detached
       and attached again, and an item unmounting in between would find no list
       and no focus holder to take its name off. */
    const attachList = useCallback<React.RefCallback<HTMLElement>>(node => {
        listRef.current = node;
    }, []);

    const attachFocusHolder = useCallback<React.RefCallback<HTMLElement>>(
        node => {
            focusHolderRef.current = node;
        },
        []
    );

    const setActive = (item: HTMLElement) => {
        const previous = activeIdRef.current;
        if (previous === item.id) return;

        if (previous !== null)
            document.getElementById(previous)?.removeAttribute("data-active");
        activeIdRef.current = item.id;
        item.setAttribute("data-active", "");
        const holder = focusHolderRef.current ?? listRef.current;
        holder?.setAttribute("aria-activedescendant", item.id);
    };

    /** Back to no active item: nothing marked, nothing named. */
    const reset = () => {
        const previous = activeIdRef.current;
        if (previous === null) return;

        document.getElementById(previous)?.removeAttribute("data-active");
        activeIdRef.current = null;
        const holder = focusHolderRef.current ?? listRef.current;
        holder?.removeAttribute("aria-activedescendant");
    };

    /** The active item, for a widget that commits it on Enter. */
    const getActiveItem = (): HTMLElement | null =>
        activeIdRef.current === null
            ? null
            : document.getElementById(activeIdRef.current);

    const activate = (item: HTMLElement) => {
        setActive(item);
        reveal(item);
    };

    /* An item that has gone, filtered out or unmounted, must not stay named:
       `aria-activedescendant` would point at nothing. Held across renders: a
       new callback each render would run the old one's cleanup on the active
       item and wipe the name at every render of the owner. */
    const forgetOnUnmount = useCallback<React.RefCallback<HTMLElement>>(
        node => {
            if (node === null) return;

            return () => {
                if (activeIdRef.current !== node.id) return;
                activeIdRef.current = null;
                const holder = focusHolderRef.current ?? listRef.current;
                holder?.removeAttribute("aria-activedescendant");
            };
        },
        []
    );

    /* Only a press that is about to focus the list: one inside an already
       focused list fires no focus event, and the flag would then swallow the
       next keyboard entry. */
    const onPointerDown: React.PointerEventHandler<HTMLElement> = event => {
        if (event.currentTarget !== document.activeElement)
            pointerRef.current = true;
    };

    /* Entering by keyboard lands on the item left last, else the first one. */
    const onFocus: React.FocusEventHandler<HTMLElement> = event => {
        if (event.target !== event.currentTarget) return;

        if (pointerRef.current) {
            pointerRef.current = false;
            return;
        }

        const items = itemsOf(event.currentTarget);
        const entry =
            items.find(item => item.id === activeIdRef.current) ?? items[0];
        if (entry !== undefined) activate(entry);
    };

    /* Only the keys it moves on are prevented: anything else reaches the list,
       or the input and the form the list belongs to. */
    const onKeyDown: React.KeyboardEventHandler<HTMLElement> = event => {
        if (event.ctrlKey || event.metaKey || event.altKey) return;

        const list = listRef.current;
        if (list === null) return;

        const items = itemsOf(list);
        if (items.length === 0) return;

        const at = items.findIndex(item => item.id === activeIdRef.current);
        const step = stepIndex(event.key, orientation, at, items.length, {
            loop,
            homeEnd
        });
        if (step === null) return;

        event.preventDefault();
        const item = items[step];
        if (item !== undefined) activate(item);
    };

    /* One handler on the list for every item's click: a press makes the item
       under it active, and the next arrow carries on from there. */
    const onClick: React.MouseEventHandler<HTMLElement> = event => {
        if (!(event.target instanceof Element)) return;

        const item = event.target.closest<HTMLElement>(`[${ITEM_ATTRIBUTE}]`);
        if (item !== null && event.currentTarget.contains(item))
            setActive(item);
    };

    /**
     * Spread on the list: its one tab stop. Compose a ref or a handler of your
     * own with `composeRefs` and `composeEventHandlers`.
     */
    const listProps = {
        ref: attachList,
        tabIndex: 0,
        "aria-orientation": orientation,
        onFocus,
        onKeyDown,
        onPointerDown,
        onClick
    };

    /**
     * Spread on an item, by its unique `id`. Compose a ref of your own with
     * `composeRefs`.
     */
    const getItemProps = (id: string) => ({
        id,
        ref: forgetOnUnmount,
        [ITEM_ATTRIBUTE]: ""
    });

    return {
        listProps,
        getItemProps,
        attachList,
        attachFocusHolder,
        onKeyDown,
        setActive,
        reset,
        getActiveItem
    };
};

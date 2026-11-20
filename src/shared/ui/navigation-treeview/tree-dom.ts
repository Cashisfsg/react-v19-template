/* The tree is walked in the DOM, in document order, which is the order a
   reader sees: the items render inside one another, and React keeps no list
   of them that could fall out of step. */

export const ITEM_SELECTOR = '[role="treeitem"]';

export const CURRENT_SELECTOR = '[role="treeitem"][aria-current="page"]';

/* Shown when no group around it is collapsed — every ancestor, not only the
   nearest, which the APG example's script checks alone. */
const isShown = (item: Element) =>
    item.parentElement?.closest('[role="group"][hidden]') === null;

export const shownItems = (tree: Element) =>
    Array.from(tree.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter(
        isShown
    );

/** The item whose group holds this one, or `null` at the top level. */
export const parentItem = (item: Element) =>
    item
        .closest('[role="group"]')
        ?.parentElement?.querySelector<HTMLElement>(
            `:scope > ${ITEM_SELECTOR}`
        ) ?? null;

/* The tree's one tab stop: the item that has it gets `tabindex="0"`, every
   other `-1`. Written in the DOM, as the APG script does, and never rendered
   by React, so a render cannot undo it; and before the script runs every
   link is a tab stop of its own, which is a plain list of links. */
export const setTabStop = (tree: Element, stop: Element) => {
    for (const item of tree.querySelectorAll(ITEM_SELECTOR)) {
        item.setAttribute("tabindex", item === stop ? "0" : "-1");
    }
};

/** The current page, or the shown item nearest above it, or the first one. */
export const restTabStop = (tree: Element) => {
    let item: HTMLElement | null =
        tree.querySelector<HTMLElement>(CURRENT_SELECTOR);
    while (item !== null && !isShown(item)) item = parentItem(item);

    const stop = item ?? shownItems(tree)[0];
    if (stop !== undefined) setTabStop(tree, stop);
};

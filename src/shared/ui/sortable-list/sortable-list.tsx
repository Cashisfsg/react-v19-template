import { useLayoutEffect, useRef, useState } from "react";

import { DEFAULT_LABELS, type SortableListLabels } from "./labels";
import { moveItem } from "./move-item";

import styles from "./sortable-list.module.css";

/* Firefox starts no drag without data, and the type tells our drags from a
   file or a link passing over the list. Custom types are lowercase. */
const DRAG_TYPE = "application/x-sortable-item";

const ITEM_ATTRIBUTE = "data-sortable-item";

type Side = "before" | "after";
type Move = "up" | "down";

interface DropTarget {
    key: string;
    side: Side;
}

interface SortableListProps<T> extends Omit<
    React.ComponentProps<"ol">,
    "children" | "onDragOver" | "onDragLeave" | "onDrop"
> {
    items: readonly T[];
    /** A key that stays with an item through every move. */
    getKey: (item: T) => string;
    /** The item's name, as the buttons and the announcements say it. */
    getLabel: (item: T) => string;
    /** The new order, for the caller to keep: the list holds none of its own. */
    onReorder: (items: T[]) => void;
    renderItem: (item: T) => React.ReactNode;
    labels?: Partial<SortableListLabels> | undefined;
}

/**
 * A list a person puts in order: by dragging a row's handle, or with the
 * row's Up and Down buttons.
 *
 * The buttons are not a fallback. WCAG 2.5.7 asks that whatever is done by
 * dragging can be done by a single pointer without it, and 2.1.1 that it can
 * be done from the keyboard; adjacent move controls are the W3C's own example
 * of both. So the handle is for the mouse alone and hidden from assistive
 * technology, and the buttons are where the keyboard and a screen reader go.
 * Focus stays on the button pressed, and at either end the button refuses
 * through `aria-disabled` rather than `disabled`, so the focus is never
 * dropped. Each move is read out by a status region.
 *
 * The drag is the HTML Drag and Drop API's: the handle is the draggable
 * element and the whole row its image, the data is the item's key, the
 * effect is a move, and `dragend` clears up whether the drop happened or not.
 * The rows carry `data-dragging` and `data-drop="before" | "after"` for the
 * caller to style.
 *
 * https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements
 * https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_operations
 */
export const SortableList = <T,>({
    items,
    getKey,
    getLabel,
    onReorder,
    renderItem,
    labels: ownLabels,
    className = "",
    ...props
}: SortableListProps<T>) => {
    const labels = { ...DEFAULT_LABELS, ...ownLabels };
    const listRef = useRef<HTMLOListElement>(null);
    /* The key being dragged: a ref, because the dragover events read it
       before any render could. `null` means the drag is not one of ours. */
    const draggedRef = useRef<string | null>(null);
    const pendingFocusRef = useRef<{ key: string; move: Move } | null>(null);

    const [draggedKey, setDraggedKey] = useState<string | null>(null);
    const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
    const [announcement, setAnnouncement] = useState("");

    /* React keeps the pressed button's node, but moving it in the DOM can
       take the focus off it, depending on which rows it moves. */
    useLayoutEffect(() => {
        const pending = pendingFocusRef.current;
        pendingFocusRef.current = null;
        if (pending === null) return;

        const button = listRef.current?.querySelector<HTMLElement>(
            `[data-key="${CSS.escape(pending.key)}"][data-move="${pending.move}"]`
        );
        if (button !== null && button !== document.activeElement) {
            button?.focus();
        }
    }, [items]);

    const indexOf = (key: string) =>
        items.findIndex(item => getKey(item) === key);

    const commit = (from: number, to: number) => {
        const moved = items[from];
        if (moved === undefined || from === to) return;

        const next = moveItem(items, from, to);
        onReorder(next);

        const previous = next[to - 1];
        const following = next[to + 1];
        setAnnouncement(
            labels.moved(
                getLabel(moved),
                previous === undefined ? undefined : getLabel(previous),
                following === undefined ? undefined : getLabel(following)
            )
        );
    };

    const handleMove: React.MouseEventHandler<HTMLButtonElement> = event => {
        const button = event.currentTarget;
        if (button.getAttribute("aria-disabled") === "true") return;

        const { key, move } = button.dataset;
        if (key === undefined || (move !== "up" && move !== "down")) return;

        const from = indexOf(key);
        const to = move === "up" ? from - 1 : from + 1;
        if (from === -1 || to < 0 || to >= items.length) return;

        pendingFocusRef.current = { key, move };
        commit(from, to);
    };

    const handleDragStart: React.DragEventHandler<HTMLSpanElement> = event => {
        const { key } = event.currentTarget.dataset;
        if (key === undefined) return;

        draggedRef.current = key;
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData(DRAG_TYPE, key);

        const row = event.currentTarget.closest("li");
        if (row !== null) {
            const box = row.getBoundingClientRect();
            event.dataTransfer.setDragImage(
                row,
                event.clientX - box.left,
                event.clientY - box.top
            );
        }

        /* After the browser has taken its picture: some engines cancel a drag
           whose source changes during `dragstart`. */
        requestAnimationFrame(() => {
            setDraggedKey(key);
        });
    };

    const handleDragEnd = () => {
        draggedRef.current = null;
        setDraggedKey(null);
        setDropTarget(null);
    };

    const handleDragOver: React.DragEventHandler<HTMLOListElement> = event => {
        if (draggedRef.current === null) return;
        if (!(event.target instanceof Element)) return;

        /* Cancelled on every dragover, and the effect stated each time. */
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";

        const row = event.target.closest<HTMLElement>(`[${ITEM_ATTRIBUTE}]`);
        const key = row?.dataset.key;
        if (row === null || key === undefined) return;

        const box = row.getBoundingClientRect();
        const side: Side =
            event.clientY < box.top + box.height / 2 ? "before" : "after";

        if (dropTarget?.key !== key || dropTarget.side !== side) {
            setDropTarget({ key, side });
        }
    };

    const handleDragLeave: React.DragEventHandler<HTMLOListElement> = event => {
        const { relatedTarget } = event;
        if (
            relatedTarget instanceof Node &&
            event.currentTarget.contains(relatedTarget)
        ) {
            return;
        }
        setDropTarget(null);
    };

    const handleDrop: React.DragEventHandler<HTMLOListElement> = event => {
        const dragged = draggedRef.current;
        if (dragged === null) return;
        event.preventDefault();

        if (dropTarget !== null) {
            const from = indexOf(dragged);
            const target = indexOf(dropTarget.key);
            let to = dropTarget.side === "after" ? target + 1 : target;
            /* Taking the item out shifts everything after it up by one. */
            if (from < to) to -= 1;
            if (from !== -1 && target !== -1) commit(from, to);
        }

        setDropTarget(null);
    };

    return (
        <>
            <ol
                {...props}
                ref={listRef}
                className={`${styles.list} ${className}`.trim()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {items.map((item, index) => {
                    const key = getKey(item);
                    const label = getLabel(item);
                    const drop =
                        dropTarget?.key === key && key !== draggedKey
                            ? dropTarget.side
                            : undefined;

                    return (
                        <li
                            key={key}
                            {...{ [ITEM_ATTRIBUTE]: "" }}
                            data-key={key}
                            data-dragging={key === draggedKey || undefined}
                            data-drop={drop}
                            className={styles.item}
                        >
                            {/* Six dots, the mark a grab handle wears. For the
                                mouse alone: the buttons beside it do the same
                                for everyone else. */}
                            <span
                                draggable
                                aria-hidden="true"
                                data-key={key}
                                className={styles.handle}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                            >
                                ⠿
                            </span>
                            <div className={styles.content}>
                                {renderItem(item)}
                            </div>
                            <div className={styles.controls}>
                                <button
                                    type="button"
                                    aria-label={labels.moveUp(label)}
                                    aria-disabled={index === 0 || undefined}
                                    data-key={key}
                                    data-move="up"
                                    className={styles.move}
                                    onClick={handleMove}
                                >
                                    <span aria-hidden="true">↑</span>
                                </button>
                                <button
                                    type="button"
                                    aria-label={labels.moveDown(label)}
                                    aria-disabled={
                                        index === items.length - 1 || undefined
                                    }
                                    data-key={key}
                                    data-move="down"
                                    className={styles.move}
                                    onClick={handleMove}
                                >
                                    <span aria-hidden="true">↓</span>
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ol>
            {/* Always in the DOM: a region added together with its text is
                not read out. Polite, since a move is the answer to the
                person's own press. */}
            <div
                role="status"
                className={styles.status}
            >
                {announcement}
            </div>
        </>
    );
};

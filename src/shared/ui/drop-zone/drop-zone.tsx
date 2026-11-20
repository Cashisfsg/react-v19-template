import { useEffect, useRef, useState } from "react";

import { composeEventHandlers } from "~/shared/lib/utils/compose-event-handlers";

import { accepts } from "./accepts";

import styles from "./drop-zone.module.css";

/* Marks every zone on the page, so the window guard below can tell a drop on
   some zone from a drop beside them all. */
const ZONE_ATTRIBUTE = "data-drop-zone";

/* "Files" is among the types whenever files are dragged, and the type list
   is all a page may read before the drop. */
const isFileDrag = (event: DragEvent | React.DragEvent) =>
    event.dataTransfer?.types.includes("Files") ?? false;

const isInZone = (target: EventTarget | null) =>
    target instanceof Element && target.closest(`[${ZONE_ATTRIBUTE}]`) !== null;

/* A file dropped beside a zone would be opened by the browser in place of
   the page. One listener for all zones: a missed drop says "none" and is
   refused. Anything that is not files keeps its default, links most of all. */
const guardWindow = () => {
    const onDragOver = (event: DragEvent) => {
        if (!isFileDrag(event)) return;
        event.preventDefault();
        if (!isInZone(event.target) && event.dataTransfer) {
            event.dataTransfer.dropEffect = "none";
        }
    };
    const onDrop = (event: DragEvent) => {
        if (isFileDrag(event)) event.preventDefault();
    };

    window.addEventListener("dragover", onDragOver);
    window.addEventListener("drop", onDrop);

    return () => {
        window.removeEventListener("dragover", onDragOver);
        window.removeEventListener("drop", onDrop);
    };
};

let guards = 0;
let releaseGuard: (() => void) | undefined;

const useWindowGuard = () => {
    useEffect(() => {
        guards += 1;
        if (guards === 1) releaseGuard = guardWindow();

        return () => {
            guards -= 1;
            if (guards === 0) releaseGuard?.();
        };
    }, []);
};

interface DropZoneProps extends Omit<
    React.ComponentProps<"label">,
    "onDrop" | "onChange"
> {
    /** The files taken, by a drop or by the picker. Never empty. */
    onFiles: (files: File[]) => void;
    /** The dropped files `accept` turned away, for the caller to explain. */
    onReject?: ((files: File[]) => void) | undefined;
    /** As on `<input type="file">`, and applied to drops as well. */
    accept?: string | undefined;
    multiple?: boolean | undefined;
    disabled?: boolean | undefined;
    /** The input's name, for a zone inside a form that submits natively. */
    name?: string | undefined;
}

/**
 * A place to drop files, and a file picker in the same box.
 *
 * The box is the `<label>` of a real `<input type="file">`: a click or a tap
 * opens the picker, Tab reaches the input, and its accessible name is the
 * zone's text. That is the way in for anyone who does not drag — the
 * keyboard, a screen reader, a phone — as MDN's file drop example does it.
 *
 * Only a drag of files is answered; dragged text or links pass by. While
 * files hover, the zone carries `data-dragover` for the caller to style.
 * The enter and leave events are counted, since moving onto the zone's own
 * text fires a leave on the zone. And a file dropped beside every zone is
 * refused rather than opened by the browser over the page.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop
 */
export const DropZone: React.FC<DropZoneProps> = ({
    onFiles,
    onReject,
    accept,
    multiple = false,
    disabled = false,
    name,
    className = "",
    children,
    onDragEnter,
    onDragOver,
    onDragLeave,
    ...props
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const depthRef = useRef(0);

    useWindowGuard();

    const take = (files: File[]) => {
        const accepted = files.filter(file => accepts(file, accept));
        const rejected = files.filter(file => !accepts(file, accept));
        const taken = multiple ? accepted : accepted.slice(0, 1);

        if (taken.length > 0) onFiles(taken);
        if (rejected.length > 0) onReject?.(rejected);
    };

    const onDragEnterHandler: React.DragEventHandler<
        HTMLLabelElement
    > = event => {
        if (disabled || !isFileDrag(event)) return;
        depthRef.current += 1;
        setIsDragOver(true);
    };

    const onDragOverHandler: React.DragEventHandler<
        HTMLLabelElement
    > = event => {
        if (disabled || !isFileDrag(event)) return;
        /* Cancelled on every dragover, and the effect stated each time: that
           is what makes the zone a target and keeps the cursor a copy. */
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
    };

    const onDragLeaveHandler: React.DragEventHandler<
        HTMLLabelElement
    > = event => {
        if (disabled || !isFileDrag(event)) return;
        depthRef.current = Math.max(0, depthRef.current - 1);
        if (depthRef.current === 0) setIsDragOver(false);
    };

    const onDropHandler: React.DragEventHandler<HTMLLabelElement> = event => {
        if (disabled || !isFileDrag(event)) return;
        event.preventDefault();
        depthRef.current = 0;
        setIsDragOver(false);
        take(Array.from(event.dataTransfer.files));
    };

    const onChangeHandler: React.ChangeEventHandler<
        HTMLInputElement
    > = event => {
        const input = event.currentTarget;
        take(Array.from(input.files ?? []));
        /* Cleared, so picking the same file again is a change again. The
           files went to the caller, who keeps them. */
        input.value = "";
    };

    return (
        <label
            {...props}
            {...{ [ZONE_ATTRIBUTE]: "" }}
            data-dragover={isDragOver || undefined}
            data-disabled={disabled || undefined}
            className={`${styles["drop-zone"]} ${className}`.trim()}
            // eslint-disable-next-line react-hooks/refs -- composeEventHandlers only invokes the handler on a drag event, not during render
            onDragEnter={composeEventHandlers(onDragEnter, onDragEnterHandler)}
            onDragOver={composeEventHandlers(onDragOver, onDragOverHandler)}
            // eslint-disable-next-line react-hooks/refs -- composeEventHandlers only invokes the handler on a drag event, not during render
            onDragLeave={composeEventHandlers(onDragLeave, onDragLeaveHandler)}
            onDrop={onDropHandler}
        >
            <input
                type="file"
                name={name}
                accept={accept}
                multiple={multiple}
                disabled={disabled}
                className={styles.input}
                onChange={onChangeHandler}
            />
            {children}
        </label>
    );
};

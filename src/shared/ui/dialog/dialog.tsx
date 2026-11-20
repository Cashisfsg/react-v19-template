import { Activity, Children, useId, useMemo, useRef, useState } from "react";

import { ErrorBoundary } from "~/shared/ui/error-boundary";
import { Portal } from "~/shared/ui/portal";

import { composeEventHandlers } from "~/shared/lib/utils/compose-event-handlers";
import { composeRefs } from "~/shared/lib/utils/compose-refs";

import { DialogContext, useDialogContext } from "./use-dialog-context";

import styles from "./dialog.module.css";

interface RootProps extends React.PropsWithChildren {}

export const Root: React.FC<RootProps> = ({ children }) => {
    const dialogId = `dialog-${useId()}`;
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    const contextValue = useMemo(
        () => ({ dialogId, dialogRef, isOpen, setIsOpen }),
        [dialogId, isOpen]
    );

    return <DialogContext value={contextValue}>{children}</DialogContext>;
};

Root.displayName = "Dialog.Root";

interface TriggerProps extends Omit<
    React.ComponentProps<"button">,
    "aria-haspopup" | "aria-controls"
> {
    command?: "show" | "show-modal";
}

export const Trigger: React.FC<TriggerProps> = ({
    type = "button",
    command,
    className,
    onClick,
    ...props
}) => {
    const { dialogId, dialogRef, isOpen, setIsOpen } = useDialogContext();

    const onClickHandler: React.MouseEventHandler<HTMLButtonElement> = () => {
        if (dialogRef.current?.open) {
            dialogRef.current.close();
        } else {
            switch (command) {
                case "show":
                    dialogRef.current?.show();
                    break;

                case "show-modal":
                default:
                    dialogRef.current?.showModal();
                    break;
            }
            /* Said here as well as by `toggle`: a `<dialog>` only fires that
               from Chromium 132, and before it the contents would stay hidden
               for good. */
            setIsOpen(true);
        }
    };

    return (
        <button
            /* A default the caller may override. */
            aria-expanded={isOpen}
            {...props}
            type={type}
            aria-haspopup="dialog"
            aria-controls={dialogId}
            className={`${styles.trigger} ${className || ""}`.trim()}
            // eslint-disable-next-line react-hooks/refs -- composeEventHandlers only invokes onClickHandler on user click, not during render
            onClick={composeEventHandlers(onClick, onClickHandler)}
        />
    );
};

Trigger.displayName = "Dialog.Trigger";

/* `tabIndex` is omitted rather than merely left unset: MDN carries it as a
   warning — "The `tabindex` attribute must not be used on the `<dialog>`
   element" — because the dialog "is not interactive and does not receive focus.
   The dialog's contents, including the close button contained in the dialog,
   can receive focus and be interactive." Since `{...props}` reaches the
   element, a caller could otherwise put one there, and a `tabindex="0"` dialog
   inserts an inert stop into the tab order of every screen that opens it.
   https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog

   `autofocus` is deliberately left available: MDN recommends it on "the element
   the user is expected to interact with immediately upon opening a modal
   dialog", and only the caller knows which one that is. */
/** How the dialog comes and goes: `fade` only, or `rise` into place as well. */
export type DialogMotion = "fade" | "rise";

interface ContentProps extends Omit<
    React.ComponentProps<"dialog">,
    "id" | "tabIndex"
> {
    motion?: DialogMotion;
}

export const Content: React.FC<ContentProps> = ({
    className,
    motion = "fade",
    closedby = "any",
    onToggle,
    onClose,
    onClick,
    onCancel,
    children,
    ref,
    ...props
}) => {
    const { dialogId, dialogRef, isOpen, setIsOpen } = useDialogContext();

    const onToggleHandler: React.ToggleEventHandler<
        HTMLDialogElement
    > = event => {
        setIsOpen(event.newState === "open");
    };

    /* `close` has always fired, where `toggle` may not: see `Trigger`. */
    const onCloseHandler: React.ReactEventHandler<HTMLDialogElement> = () => {
        setIsOpen(false);
    };

    /* Tap-outside-to-dismiss without relying on `closedby`: a browser that
       predates the attribute ignores it, and a modal <dialog> then has no way
       out but an in-content button, so one that forgot it traps the user. A
       click on the backdrop lands on the <dialog> element itself (the
       ::backdrop is its own pseudo-element), so the target being the dialog is
       where dismissal starts.

       It is not where it ends: a dialog that pads itself has a ring of its own
       box around the content, and a tap there is also a tap on the dialog —
       which would close it from inside. So the pointer is measured against the
       box as well, and only a tap beyond it dismisses. A box of no size is a
       test environment, where a layout is never computed; there the target
       alone decides. */
    const onBackdropClick: React.MouseEventHandler<
        HTMLDialogElement
    > = event => {
        if (closedby !== "any" || event.target !== event.currentTarget) return;

        const { top, left, width, height } =
            event.currentTarget.getBoundingClientRect();
        const isWithinBox =
            width > 0 &&
            height > 0 &&
            event.clientX >= left &&
            event.clientX <= left + width &&
            event.clientY >= top &&
            event.clientY <= top + height;

        if (!isWithinBox) event.currentTarget.close();
    };

    /* The same browsers ignore `closedby="none"` and still close on Escape; the
       cancel event is where that close request can be refused. */
    const onCancelHandler: React.ReactEventHandler<
        HTMLDialogElement
    > = event => {
        if (closedby === "none") event.preventDefault();
    };

    return (
        <Portal>
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- backdrop dismissal is a pointer-only enhancement; a keyboard user closes a modal <dialog> with Escape, which stays native */}
            <dialog
                {...props}
                id={dialogId}
                /* After the spread on purpose: the type omits `tabIndex`, but a
                   type is only advice — a cast, an `any`, or a props object
                   built at runtime all get past it. `undefined` renders no
                   attribute at all, so the element cannot carry one however it
                   was handed over. */
                tabIndex={undefined}
                closedby={closedby}
                className={[
                    styles.dialog,
                    motion === "rise" && styles.rise,
                    className
                ]
                    .filter(Boolean)
                    .join(" ")}
                onToggle={composeEventHandlers(onToggle, onToggleHandler)}
                onClose={composeEventHandlers(onClose, onCloseHandler)}
                onClick={composeEventHandlers(onClick, onBackdropClick)}
                onCancel={composeEventHandlers(onCancel, onCancelHandler)}
                ref={composeRefs(dialogRef, ref)}
            >
                <Activity mode={isOpen ? "visible" : "hidden"}>
                    <ErrorBoundary>{children}</ErrorBoundary>
                </Activity>
            </dialog>
        </Portal>
    );
};

Content.displayName = "Dialog.Content";

interface CloseProps extends React.ComponentProps<"button"> {
    command?: "close" | "request-close";
}

/**
 * Closes the dialog it sits in. Without children it draws a cross named by
 * `aria-label`; with children it renders them as they are.
 */
export const Close: React.FC<CloseProps> = ({
    type = "button",
    command,
    className,
    onClick,
    children,
    ...props
}) => {
    const { dialogRef } = useDialogContext();
    /* `null` and `false` count as none, so `{cond && "Cancel"}` falls back to
       the cross rather than an empty, unnamed button. */
    const hasChildren = Children.toArray(children).length > 0;

    const onClickHandler: React.MouseEventHandler<HTMLButtonElement> = () => {
        switch (command) {
            case "request-close":
                dialogRef.current?.requestClose();
                break;

            case "close":
            default:
                dialogRef.current?.close();
                break;
        }
    };

    return (
        <button
            aria-label={hasChildren ? undefined : "Close"}
            {...props}
            type={type}
            className={[styles.close, !hasChildren && styles.cross, className]
                .filter(Boolean)
                .join(" ")}
            // eslint-disable-next-line react-hooks/refs -- composeEventHandlers only invokes onClickHandler on user click, not during render
            onClick={composeEventHandlers(onClick, onClickHandler)}
        >
            {hasChildren ? (
                children
            ) : (
                <svg
                    aria-hidden="true"
                    focusable="false"
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                </svg>
            )}
        </button>
    );
};

Close.displayName = "Dialog.Close";

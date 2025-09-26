import { useId, useMemo, useRef } from "react";

import { composeEventHandlers } from "~/shared/lib/utils/compose-event-handlers";
import { composeRefs } from "~/shared/lib/utils/compose-refs";

import { DialogContext, useDialogContext } from "./use-dialog-context";

interface RootProps extends React.PropsWithChildren {}

import styles from "./dialog.module.css";

export const Root: React.FC<RootProps> = ({ children }) => {
    const dialogId = `dialog-${useId()}`;
    const dialogRef = useRef<HTMLDialogElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const contextValue = useMemo(
        () => ({ dialogId, dialogRef, triggerRef }),
        [dialogId]
    );

    return (
        <DialogContext.Provider value={contextValue}>
            {children}
        </DialogContext.Provider>
    );
};

Root.displayName = "Dialog.Root";

interface TriggerProps
    extends Omit<
        React.ComponentProps<"button">,
        "aria-expanded" | "aria-haspopup" | "aria-controls"
    > {}

export const Trigger: React.FC<TriggerProps> = ({ onClick, ...props }) => {
    const { dialogId, dialogRef, triggerRef } = useDialogContext();

    const onClickHandler: React.MouseEventHandler<
        HTMLButtonElement
    > = event => {
        const trigger = event.currentTarget;
        const rootElement = document.querySelector("#root");
        const dialogOpen = trigger.getAttribute("aria-expanded") === "true";

        if (dialogOpen) {
            dialogRef.current?.close();
        } else {
            dialogRef.current?.showModal();
            rootElement?.setAttribute("inert", "");
            rootElement?.setAttribute("aria-hidden", "true");
        }

        trigger.setAttribute("aria-expanded", String(!dialogOpen));
    };

    return (
        <button
            aria-haspopup="dialog"
            aria-expanded="false"
            aria-controls={dialogId}
            onClick={composeEventHandlers(onClick, onClickHandler)}
            ref={triggerRef}
            {...props}
        />
    );
};

Trigger.displayName = "Dialog.Trigger";

// interface PortalProps extends React.PropsWithChildren {}

// export const Portal: React.FC<PortalProps> = ({ children }) => {
//     return <DialogPortal>{children}</DialogPortal>;
// };

// Portal.displayName = "Dialog.Portal";

interface ContentProps extends Omit<React.ComponentProps<"dialog">, "id"> {
    closedby: "any" | "closerequest" | "none";
}

export const Content: React.FC<ContentProps> = ({
    className,
    closedby = "any",
    onClose,
    children,
    ref,
    ...props
}) => {
    const { dialogId, dialogRef, triggerRef } = useDialogContext();

    const onCloseHandler: React.ReactEventHandler<HTMLDialogElement> = () => {
        const rootElement = document.querySelector("div#root");

        rootElement?.removeAttribute("inert");
        rootElement?.removeAttribute("aria-hidden");
        triggerRef.current?.setAttribute("aria-expanded", "false");
        triggerRef.current?.focus();
    };

    return (
        <dialog
            {...props}
            id={dialogId}
            closedby={closedby}
            className={`${styles.modal} ${className}`.trim()}
            onClose={composeEventHandlers(onClose, onCloseHandler)}
            ref={composeRefs(dialogRef, ref)}
        >
            {children}
        </dialog>
    );
};

Content.displayName = "Dialog.Content";

interface CloseProps
    extends Omit<
        React.ComponentProps<"button">,
        "aria-haspopup" | "aria-controls"
    > {}

export const Close: React.FC<CloseProps> = ({ onClick, ...props }) => {
    const { dialogRef, triggerRef } = useDialogContext();

    const onClickHandler: React.MouseEventHandler<HTMLButtonElement> = () => {
        dialogRef.current?.close();
        triggerRef.current?.setAttribute("aria-expanded", "false");
    };

    return (
        <button
            onClick={composeEventHandlers(onClick, onClickHandler)}
            {...props}
        />
    );
};

Close.displayName = "Dialog.Close";

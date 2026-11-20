import { useCallback, useEffect, useId, useMemo, useRef } from "react";

import { Anchor, type AnchorPlacement } from "~/shared/ui/anchor";

import { composeEventHandlers } from "~/shared/lib/utils/compose-event-handlers";
import { composeRefs } from "~/shared/lib/utils/compose-refs";

import { TooltipContext, useTooltipContext } from "./use-tooltip-context";

import styles from "./tooltip.module.css";

const OPEN_DELAY = 1000;
const CLOSE_DELAY = 500;

interface RootProps extends React.PropsWithChildren {}

/**
 * A short description of a control, shown while it is hovered or focused.
 *
 * Built on a `hint` popover hung off the trigger by `shared/ui/anchor`. Not on
 * `Popover`: that one opens by `popovertarget`, which makes the trigger a
 * control that expands a panel, and a tooltip only describes its trigger.
 */
export const Root: React.FC<RootProps> = ({ children }) => {
    const tooltipId = `tooltip-${useId()}`;
    const tooltipRef = useRef<HTMLElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const cancel = useCallback(() => {
        clearTimeout(timeoutRef.current);
    }, []);

    const show = useCallback(() => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            tooltipRef.current?.showPopover();
        }, OPEN_DELAY);
    }, []);

    const hideNow = useCallback(() => {
        clearTimeout(timeoutRef.current);
        tooltipRef.current?.hidePopover();
    }, []);

    const hide = useCallback(() => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            tooltipRef.current?.hidePopover();
        }, CLOSE_DELAY);
    }, []);

    // WCAG 1.4.13: content shown on hover or focus can be dismissed without
    // moving the pointer or focus. A `hint` popover closes on Escape by
    // itself, but a browser without `hint` treats the value as `manual`,
    // which does not.
    const onDocumentKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === "Escape") hideNow();
        },
        [hideNow]
    );

    useEffect(
        () => () => {
            clearTimeout(timeoutRef.current);
            document.removeEventListener("keydown", onDocumentKeyDown);
        },
        [onDocumentKeyDown]
    );

    const contextValue = useMemo(
        () => ({
            tooltipId,
            tooltipRef,
            show,
            hide,
            hideNow,
            cancel,
            onDocumentKeyDown
        }),
        [tooltipId, show, hide, hideNow, cancel, onDocumentKeyDown]
    );

    return (
        <Anchor.Root>
            <TooltipContext value={contextValue}>{children}</TooltipContext>
        </Anchor.Root>
    );
};

Root.displayName = "Tooltip.Root";

// A touch has no hover: a tap is the trigger's own action, and a tooltip that
// opened a second later would cover what the tap brought up.
const isHoverPointer = (event: React.PointerEvent) =>
    event.pointerType !== "touch";

interface TriggerProps extends Omit<
    React.ComponentProps<"button">,
    "aria-describedby" | "popoverTarget" | "popoverTargetAction"
> {}

/**
 * The control the tooltip describes, and only describes: no popovertarget,
 * whose implicit aria-expanded would announce a panel the reader can open,
 * no aria-haspopup or aria-controls, and a click does what the button is for.
 */
export const Trigger: React.FC<TriggerProps> = ({
    type = "button",
    onBlur,
    onClick,
    onFocus,
    onPointerEnter,
    onPointerLeave,
    ...props
}) => {
    const { tooltipId, show, hide, hideNow } = useTooltipContext();

    const onPointerEnterHandler: React.PointerEventHandler<
        HTMLButtonElement
    > = event => {
        if (isHoverPointer(event)) show();
    };

    const onPointerLeaveHandler: React.PointerEventHandler<
        HTMLButtonElement
    > = event => {
        if (isHoverPointer(event)) hide();
    };

    return (
        <Anchor.Target
            {...props}
            type={type}
            aria-describedby={tooltipId}
            onPointerEnter={composeEventHandlers(
                onPointerEnter,
                onPointerEnterHandler
            )}
            onPointerLeave={composeEventHandlers(
                onPointerLeave,
                onPointerLeaveHandler
            )}
            onFocus={composeEventHandlers(onFocus, show)}
            onBlur={composeEventHandlers(onBlur, hideNow)}
            onClick={composeEventHandlers(onClick, hideNow)}
        />
    );
};

Trigger.displayName = "Tooltip.Trigger";

interface ContentProps extends Omit<
    React.ComponentProps<"div">,
    "id" | "role" | "popover"
> {
    /** Where it goes by the trigger: above it unless stated. It flips when
        there is no room. */
    placement?: AnchorPlacement;
}

const ABOVE: AnchorPlacement = { side: "block-start" };

export const Content: React.FC<ContentProps> = ({
    className = "",
    placement = ABOVE,
    onPointerEnter,
    onPointerLeave,
    onToggle,
    ref,
    ...props
}) => {
    const { tooltipId, tooltipRef, hide, cancel, onDocumentKeyDown } =
        useTooltipContext();

    // WCAG 1.4.13 again: the pointer can move onto the tooltip without it
    // closing under it.
    const onPointerEnterHandler: React.PointerEventHandler<
        HTMLDivElement
    > = () => {
        cancel();
    };

    const onPointerLeaveHandler: React.PointerEventHandler<
        HTMLDivElement
    > = () => {
        hide();
    };

    const onToggleHandler: React.ToggleEventHandler<HTMLDivElement> = event => {
        if (event.newState === "open") {
            document.addEventListener("keydown", onDocumentKeyDown);
        } else {
            document.removeEventListener("keydown", onDocumentKeyDown);
        }
    };

    return (
        <Anchor.Positioned
            {...props}
            id={tooltipId}
            role="tooltip"
            // `hint`, unlike `auto`, leaves an open menu or popover open when
            // it shows. A browser without it falls back to `manual`.
            popover="hint"
            placement={placement}
            onPointerEnter={composeEventHandlers(
                onPointerEnter,
                onPointerEnterHandler
            )}
            onPointerLeave={composeEventHandlers(
                onPointerLeave,
                onPointerLeaveHandler
            )}
            onToggle={composeEventHandlers(onToggle, onToggleHandler)}
            ref={composeRefs(tooltipRef, ref)}
            className={`${styles.tooltip} ${className}`.trim()}
        />
    );
};

Content.displayName = "Tooltip.Content";

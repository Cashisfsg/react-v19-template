import { useCallback, useId, useMemo, useRef } from "react";
import { TooltipContext, useTooltipContext } from "./use-tooltip-context";

import { composeEventHandlers } from "~/shared/lib/utils/compose-event-handlers";
import styles from "./Tooltip.module.css";
import type { PositionArea } from "./types";

interface RootProps extends React.PropsWithChildren {}

export const Root: React.FC<RootProps> = ({ children }) => {
    const tooltipId = `tooltip-${useId()}`;
    const tooltipRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout>(undefined);

    const showTooltip = useCallback((delay: number = 1000) => {
        clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            tooltipRef.current?.showPopover();
        }, delay);
    }, []);

    const hideTooltip = useCallback((delay: number = 500) => {
        clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            tooltipRef.current?.hidePopover();
        }, delay);
    }, []);

    const contextValue = useMemo(
        () => ({
            tooltipId,
            tooltipRef,
            timeoutRef,
            showTooltip,
            hideTooltip
        }),
        [tooltipId, hideTooltip, showTooltip]
    );

    return <TooltipContext value={contextValue}>{children}</TooltipContext>;
};

Root.displayName = "Tooltip.Root";

interface TriggerProps
    extends Omit<
        React.ComponentProps<"button">,
        "popoverTarget" | "aria-controls" | "aria-haspopup" | "aria-describedby"
    > {}

export const Trigger: React.FC<TriggerProps> = ({
    className = "",
    onBlur,
    onClick,
    onFocus,
    onMouseEnter,
    onMouseLeave,
    ...props
}) => {
    const { tooltipId, tooltipRef, timeoutRef, showTooltip, hideTooltip } =
        useTooltipContext();

    const onMouseEnterHandler: React.MouseEventHandler<
        HTMLButtonElement
    > = () => {
        showTooltip();
    };

    const onMouseLeaveHandler: React.MouseEventHandler<
        HTMLButtonElement
    > = () => {
        hideTooltip();
    };

    const onFocusHandler: React.FocusEventHandler<HTMLButtonElement> = () => {
        showTooltip();
    };

    const onBlurHandler: React.FocusEventHandler<HTMLButtonElement> = () => {
        clearTimeout(timeoutRef.current);
        tooltipRef.current?.hidePopover();
    };

    const onClickHandler: React.MouseEventHandler<HTMLButtonElement> = () => {
        clearTimeout(timeoutRef.current);
    };

    return (
        <button
            {...props}
            popoverTarget={tooltipId}
            aria-haspopup="true"
            aria-controls={tooltipId}
            aria-describedby={tooltipId}
            onMouseEnter={composeEventHandlers(
                onMouseEnter,
                onMouseEnterHandler
            )}
            onMouseLeave={composeEventHandlers(
                onMouseLeave,
                onMouseLeaveHandler
            )}
            onFocus={composeEventHandlers(onFocus, onFocusHandler)}
            onBlur={composeEventHandlers(onBlur, onBlurHandler)}
            onClick={composeEventHandlers(onClick, onClickHandler)}
            data-anchor={`--${tooltipId}`}
            className={` ${styles.trigger} ${className}`.trim()}
        />
    );
};

Trigger.displayName = "Tooltip.Trigger";

interface ContentProps
    extends Omit<
        React.ComponentPropsWithoutRef<"div">,
        "id" | "role" | "popover"
    > {
    tooltipArea?: PositionArea;
}

export const Content: React.FC<ContentProps> = ({
    className = "",
    tooltipArea = "span-self-block-end self-inline-start",
    onMouseEnter,
    onMouseLeave,
    ...props
}) => {
    const { tooltipId, tooltipRef, showTooltip, hideTooltip } =
        useTooltipContext();

    const onMouseEnterHandler: React.MouseEventHandler<HTMLDivElement> = () => {
        showTooltip();
    };

    const onMouseLeaveHandler: React.MouseEventHandler<HTMLDivElement> = () => {
        hideTooltip();
    };

    return (
        <div
            {...props}
            id={tooltipId}
            role="tooltip"
            popover="auto"
            onMouseEnter={composeEventHandlers(
                onMouseEnter,
                onMouseEnterHandler
            )}
            onMouseLeave={composeEventHandlers(
                onMouseLeave,
                onMouseLeaveHandler
            )}
            data-anchor={`--${tooltipId}`}
            data-anchor-position-block={tooltipArea.split(" ")[0]}
            data-anchor-position-inline={tooltipArea.split(" ")[1]}
            ref={tooltipRef}
            className={`${styles.tooltip} ${className}`.trim()}
        />
    );
};

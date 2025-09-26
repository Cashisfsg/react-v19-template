import { useId, useMemo, useRef } from "react";

import { composeRefs } from "~/shared/lib/utils/compose-refs";

import styles from "./popover.module.css";
import { PopoverContext, usePopoverContext } from "./use-popover-context";

interface PopoverRootProps extends React.PropsWithChildren {}

export const Root: React.FC<PopoverRootProps> = ({ children }) => {
    const popoverId = `popover-${useId()}`;
    const popoverRef = useRef<HTMLElement>(null);

    const contextValue = useMemo(
        () => ({ popoverId, popoverRef }),
        [popoverId]
    );

    return (
        <PopoverContext.Provider value={contextValue}>
            {children}
        </PopoverContext.Provider>
    );
};

Root.displayName = "Popover.Root";

// export const Portal = PopoverPortal;

// Portal.displayName = "Popover.Portal";

interface PopoverTriggerProps
    extends Omit<
        React.ComponentPropsWithoutRef<"button">,
        "popoverTarget" | "id"
    > {}

export const Trigger: React.FC<PopoverTriggerProps> = ({
    type = "button",
    popoverTargetAction = "toggle",
    ...props
}) => {
    const triggerId = `popover-trigger-${useId()}`;
    const { popoverId } = usePopoverContext();

    return (
        <button
            {...props}
            id={triggerId}
            type={type}
            popoverTarget={popoverId}
            popoverTargetAction={popoverTargetAction}
        />
    );
};

Trigger.displayName = "Popover.Trigger";

type TagType<E extends React.ElementType = React.ElementType> = Partial<
    Record<"as", E>
>;

type PopoverContentProps<E extends React.ElementType> = TagType<E> &
    Omit<React.ComponentProps<E>, keyof TagType>;

export const Content = <E extends React.ElementType = "div">({
    as,
    popover = "auto",
    className = "",
    ref,
    ...props
}: PopoverContentProps<E>) => {
    const { popoverId, popoverRef } = usePopoverContext();
    const TagName = as || "div";

    return (
        <TagName
            id={popoverId}
            popover={popover}
            className={`${styles.popover} ${className}`.trim()}
            ref={composeRefs(popoverRef, ref)}
            {...props}
        />
    );
};

interface PopoverCloseProps
    extends Omit<
        React.ComponentPropsWithoutRef<"button">,
        "popoverTarget" | "popoverTargetAction"
    > {}

export const Close: React.FC<PopoverCloseProps> = ({
    type = "button",
    ...props
}) => {
    const { popoverId } = usePopoverContext();

    return (
        <button
            {...props}
            type={type}
            popoverTarget={popoverId}
            popoverTargetAction="hide"
        />
    );
};

Close.displayName = "Popover.Close";

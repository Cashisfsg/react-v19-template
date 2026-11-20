import { useState } from "react";

import { composeEventHandlers } from "~/shared/lib/utils/compose-event-handlers";

import {
    switchVariants,
    type SwitchOrientation,
    type SwitchSize,
    type SwitchVariant
} from "./switch-variants";

/**
 * Switch defaults to a non-form toggle. Native button submitter props such as
 * type="submit", name and value stay available for forms that inspect
 * SubmitEvent.submitter; use a native <input type="checkbox"> for passive
 * FormData state.
 */
type SwitchBaseProps = Omit<
    React.ComponentPropsWithRef<"button">,
    "role" | "defaultValue" | "aria-checked" | "onChange"
> & {
    variant?: SwitchVariant;
    size?: SwitchSize;
    orientation?: SwitchOrientation;
};

type SwitchControlledProps = SwitchBaseProps & {
    checked: boolean;
    defaultChecked?: never;
    onCheckedChange: (checked: boolean) => void;
};

type SwitchUncontrolledProps = SwitchBaseProps & {
    checked?: never;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
};

export type SwitchProps = SwitchControlledProps | SwitchUncontrolledProps;

export const Switch: React.FC<SwitchProps> = ({
    type = "button",
    checked,
    defaultChecked,
    onCheckedChange,
    onClick,
    className = "",
    variant,
    size,
    orientation,
    "aria-disabled": ariaDisabled,
    ...props
}) => {
    const [internalChecked, setInternalChecked] = useState(
        defaultChecked ?? false
    );

    const isControlled = checked !== undefined;
    const resolvedChecked = isControlled ? checked : internalChecked;

    /* `aria-disabled` announces the state without changing behaviour: MDN says
       developers "will still need to use JavaScript to fully disable the
       functionality", so without this guard the switch would tell a screen
       reader it is disabled and toggle anyway. It stays focusable on purpose,
       which is the reason to use it instead of `disabled`.
       https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-disabled

       Compared as a string because React renders `aria-disabled={false}` as
       "false"; testing for presence would freeze a switch that is fine. */
    const isAriaDisabled = ariaDisabled === true || ariaDisabled === "true";

    // The caller's own onClick still runs when aria-disabled: it is theirs.
    // The switch only refuses to toggle itself.
    const onClickHandler: React.MouseEventHandler<HTMLButtonElement> = () => {
        if (isAriaDisabled) return;

        const next = !resolvedChecked;

        if (!isControlled) {
            setInternalChecked(next);
        }

        onCheckedChange?.(next);
    };

    return (
        <button
            {...props}
            type={type}
            role="switch"
            aria-checked={resolvedChecked}
            aria-disabled={ariaDisabled}
            className={`${switchVariants({ variant, size, orientation })} ${className}`.trim()}
            onClick={composeEventHandlers(onClick, onClickHandler)}
        />
    );
};

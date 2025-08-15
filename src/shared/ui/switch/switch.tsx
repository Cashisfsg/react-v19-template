import { composeEventHandlers } from "~/shared/lib/utils/compose-event-handlers";

interface SwitchProps
    extends Omit<React.ComponentPropsWithRef<"button">, "type" | "role"> {}

export const Switch: React.FC<SwitchProps> = ({
    "aria-checked": ariaChecked = false,
    onClick,
    ...props
}) => {
    const onClickHandler: React.MouseEventHandler<
        HTMLButtonElement
    > = event => {
        const button = event.currentTarget;
        const checked = button.getAttribute("aria-checked") === "true";

        button.setAttribute("aria-checked", String(!checked));
    };

    return (
        <button
            {...props}
            type="button"
            role="switch"
            aria-checked={ariaChecked}
            onClick={composeEventHandlers(onClick, onClickHandler)}
        />
    );
};

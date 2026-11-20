import { buttonVariants, type ButtonVariant } from "./button-variants";

export interface ButtonProps extends React.ComponentProps<"button"> {
    /** The colour. Left out, the caller's own classes paint the button. */
    variant?: ButtonVariant | undefined;
    /** Pill radius; with equal padding around a lone icon, that makes a
        circle. */
    rounded?: boolean | undefined;
}

/**
 * The one `<button>` the app is built from: press, refusal and keyboard focus
 * live here, so a call site only says what the button looks like.
 *
 * `type` defaults to `"button"`, so nothing submits a form by accident.
 */
export const Button: React.FC<ButtonProps> = ({
    variant,
    rounded = false,
    type = "button",
    className = "",
    ...props
}) => (
    <button
        {...props}
        type={type}
        className={[buttonVariants({ variant, rounded }), className]
            .join(" ")
            .trim()}
    />
);

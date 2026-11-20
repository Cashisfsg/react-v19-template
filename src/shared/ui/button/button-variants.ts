import styles from "./button.module.css";

export type ButtonVariant =
    "primary" | "secondary" | "transparent" | "danger" | "cancel";

const VARIANT_CLASSES: Record<ButtonVariant, string | undefined> = {
    primary: styles["button--primary"],
    secondary: styles["button--secondary"],
    transparent: styles["button--transparent"],
    danger: styles["button--danger"],
    cancel: styles["button--cancel"]
};

interface ButtonVariantsInput {
    variant?: ButtonVariant | undefined;
    rounded?: boolean | undefined;
}

/** The look of `Button`, for a control that has to stay its own element, a
    dialog's trigger most of all. */
export const buttonVariants = ({
    variant,
    rounded = false
}: ButtonVariantsInput = {}): string =>
    [
        styles.button,
        variant === undefined ? undefined : VARIANT_CLASSES[variant],
        rounded ? styles["button--rounded"] : undefined
    ]
        .filter(Boolean)
        .join(" ");

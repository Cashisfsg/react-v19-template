import styles from "./switch.module.css";

export type SwitchVariant = "default" | "primary" | "secondary" | "danger";
export type SwitchSize = "sm" | "md" | "lg";
export type SwitchOrientation = "horizontal" | "vertical";

const VARIANT_CLASSES: Record<SwitchVariant, string | undefined> = {
    default: undefined,
    primary: undefined,
    secondary: styles["switch--secondary"],
    danger: styles["switch--danger"]
};

const SIZE_CLASSES: Record<SwitchSize, string | undefined> = {
    sm: styles["switch--sm"],
    md: undefined,
    lg: styles["switch--lg"]
};

const ORIENTATION_CLASSES: Record<SwitchOrientation, string | undefined> = {
    horizontal: undefined,
    vertical: styles["switch--vertical"]
};

interface SwitchVariantsInput {
    variant?: SwitchVariant | undefined;
    size?: SwitchSize | undefined;
    orientation?: SwitchOrientation | undefined;
}

export const switchVariants = ({
    variant = "primary",
    size = "md",
    orientation = "horizontal"
}: SwitchVariantsInput = {}): string =>
    [
        styles.switch,
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        ORIENTATION_CLASSES[orientation]
    ]
        .filter(Boolean)
        .join(" ");

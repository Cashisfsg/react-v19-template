import styles from "./progress.module.css";

interface ProgressProps extends Omit<
    React.ComponentProps<"progress">,
    | "value"
    | "max"
    | "tabIndex"
    | "aria-valuenow"
    | "aria-valuemin"
    | "aria-valuemax"
> {
    value?: number | null;
    min?: number;
    max?: number;
}

/**
 * A native `<progress>`, determinate with a `value` and indeterminate without.
 *
 * The element only knows 0 to `max`, so a range that starts elsewhere is
 * shifted into it, and the real numbers go to assistive technology through
 * the `aria-value*` attributes. The text inside is what a browser without
 * `<progress>` shows.
 */
export const Progress: React.FC<ProgressProps> = ({
    value,
    min = 0,
    max = 100,
    className = "",
    ...props
}) => {
    const isIndeterminate = value === null || value === undefined;
    const range = max - min;
    const normalizedValue =
        isIndeterminate || range <= 0 ? undefined : value - min;
    const normalizedMax = range > 0 ? range : 100;

    return (
        <progress
            {...props}
            value={normalizedValue}
            max={normalizedMax}
            aria-valuenow={isIndeterminate ? undefined : value}
            aria-valuemin={min}
            aria-valuemax={max}
            tabIndex={-1}
            className={`${styles.progress} ${className}`.trim()}
        >
            {isIndeterminate ? "unknown" : `${value}`}
        </progress>
    );
};

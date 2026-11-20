import styles from "./checkbox.module.css";

interface CheckboxProps extends React.ComponentProps<"input"> {}

export const Checkbox: React.FC<CheckboxProps> = ({
    className = "",
    ...props
}) => {
    return (
        <input
            {...props}
            type="checkbox"
            className={`${styles.checkbox} ${className}`.trim()}
        />
    );
};

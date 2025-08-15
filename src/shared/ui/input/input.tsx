import styles from "./Input.module.css";

interface InputProps extends React.ComponentPropsWithRef<"input"> {}

export const Input: React.FC<InputProps> = ({ className = "", ...props }) => {
    return (
        <input
            className={`${className} ${styles.input}`.trim()}
            {...props}
        />
    );
};

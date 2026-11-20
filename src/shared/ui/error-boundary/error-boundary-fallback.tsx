import styles from "./error-boundary-fallback.module.css";

interface ErrorBoundaryFallbackProps {
    error: Error;
    onReset?: () => void;
}

const handleReload = () => {
    window.location.reload();
};

export const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({
    error,
    onReset
}) => (
    <div
        role="alert"
        className={styles["error-fallback"]}
    >
        <h2 className={styles["error-fallback__heading"]}>
            <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
            </svg>
            Something went wrong
        </h2>

        <pre>{error.message}</pre>

        <div
            role="group"
            aria-label="Recovery actions"
        >
            {onReset && (
                <button
                    type="button"
                    onClick={onReset}
                    className={`${styles["error-fallback__button"]} ${styles["error-fallback__button--primary"]}`}
                >
                    Try again
                </button>
            )}
            <button
                type="button"
                onClick={handleReload}
                className={`${styles["error-fallback__button"]} ${styles["error-fallback__button--secondary"]}`}
            >
                Reload page
            </button>
        </div>
    </div>
);

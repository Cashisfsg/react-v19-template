import { useState } from "react";

import { ErrorBoundary } from "./error-boundary";
import { useErrorBoundary } from "./use-error-boundary";

import styles from "./error-boundary.example.module.css";

interface BombProps {
    armed: boolean;
}

const Bomb: React.FC<BombProps> = ({ armed }) => {
    if (armed) throw new Error("The bomb went off while rendering.");
    return <p>Rendering fine.</p>;
};

const AsyncFailure: React.FC = () => {
    const { showBoundary } = useErrorBoundary();

    const handleClick = () => {
        // A rejected promise never reaches a boundary on its own.
        Promise.reject(new Error("The request failed.")).catch(showBoundary);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
        >
            Fail a request
        </button>
    );
};

/**
 * The three ways a boundary gets its error and the ways it recovers, with the
 * checks a unit test cannot make:
 *
 * - Arm the first bomb: the default fallback replaces only that box, and a
 *   screen reader announces it, since it is an alert. Disarm, then Try again.
 * - Arm the second bomb: its fallback is custom. Changing the key with the
 *   select resets it without a button, and onReset warns in the console.
 * - Fail a request: the error comes from a promise, which React never sees,
 *   so showBoundary hands it over.
 * - Reload page reloads.
 *
 * Not exported from the barrel: mount it by importing this file directly.
 */
export const ErrorBoundaryExample: React.FC = () => {
    const [firstArmed, setFirstArmed] = useState(false);
    const [secondArmed, setSecondArmed] = useState(false);
    const [resetKey, setResetKey] = useState("a");

    const handleFirstChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFirstArmed(event.currentTarget.checked);
    };

    const handleSecondChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSecondArmed(event.currentTarget.checked);
    };

    const handleKeyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSecondArmed(false);
        setResetKey(event.currentTarget.value);
    };

    const handleReset = () => {
        console.warn("[ErrorBoundaryExample] reset");
    };

    const renderFallback = ({ error }: { error: Error }) => (
        <p className={styles.custom}>Custom fallback: {error.message}</p>
    );

    return (
        <section className={styles.example}>
            <h3 className={styles.title}>ErrorBoundary example</h3>

            <h4 className={styles.label}>default fallback, Try again</h4>
            <label className={styles.control}>
                <input
                    type="checkbox"
                    checked={firstArmed}
                    onChange={handleFirstChange}
                />
                Arm the bomb
            </label>
            <div className={styles.box}>
                <ErrorBoundary>
                    <Bomb armed={firstArmed} />
                </ErrorBoundary>
            </div>

            <h4 className={styles.label}>custom fallback, reset by key</h4>
            <div className={styles.control}>
                <label>
                    <input
                        type="checkbox"
                        checked={secondArmed}
                        onChange={handleSecondChange}
                    />
                    Arm the bomb
                </label>
                <label>
                    Key{" "}
                    <select
                        value={resetKey}
                        onChange={handleKeyChange}
                    >
                        <option value="a">a</option>
                        <option value="b">b</option>
                    </select>
                </label>
            </div>
            <div className={styles.box}>
                <ErrorBoundary
                    resetKeys={[resetKey]}
                    onReset={handleReset}
                    fallback={renderFallback}
                >
                    <Bomb armed={secondArmed} />
                </ErrorBoundary>
            </div>

            <h4 className={styles.label}>an error React never sees</h4>
            <div className={styles.box}>
                <ErrorBoundary>
                    <AsyncFailure />
                </ErrorBoundary>
            </div>
        </section>
    );
};

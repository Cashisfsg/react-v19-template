import { useId, useState } from "react";

import { Progress } from "./progress";

import styles from "./progress.example.module.css";

/**
 * The states of a progress bar, and the checks a unit test cannot make:
 *
 * - A screen reader reads each bar by its label and its value, and for the
 *   shifted range 15 out of 10 to 20 rather than 5 of 10.
 * - The indeterminate bar sweeps while the wait lasts; with reduced motion
 *   it slows down.
 * - At 100 of 100 a check appears at the end of the bar.
 * - Drag the slider: the fill follows with a short transition.
 *
 * Not exported from the barrel: mount it by importing this file directly.
 */
export const ProgressExample: React.FC = () => {
    const id = useId();
    const [value, setValue] = useState(40);

    const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(Number(event.currentTarget.value));
    };

    return (
        <section className={styles.example}>
            <h2 className={styles.title}>Progress example</h2>

            <label htmlFor={`${id}-upload`}>Upload</label>
            <Progress
                id={`${id}-upload`}
                value={value}
            />
            <input
                type="range"
                aria-label="Upload value"
                min={0}
                max={100}
                value={value}
                onChange={handleValueChange}
            />

            <label htmlFor={`${id}-step`}>Step, 10 to 20</label>
            <Progress
                id={`${id}-step`}
                value={15}
                min={10}
                max={20}
            />

            <label htmlFor={`${id}-done`}>Done</label>
            <Progress
                id={`${id}-done`}
                value={100}
            />

            <label htmlFor={`${id}-wait`}>Waiting for the server</label>
            <Progress
                id={`${id}-wait`}
                className={styles.accent}
            />
        </section>
    );
};

import { useState } from "react";

import { Portal } from "./portal";

import styles from "./portal.example.module.css";

/**
 * Where portal content goes, and the checks a unit test cannot make:
 *
 * - View the page source: neither note is in the server HTML. Both appear once
 *   the page has hydrated, and the console shows no hydration warning.
 * - The first note escapes the clipped box: in the elements panel it is the
 *   last child of <body>, not inside the box.
 * - Clicking a note still counts on the box: React bubbles portal events
 *   through the React tree, not the DOM one.
 * - The second note lands in the target below. It is passed through state set
 *   by a callback ref, because a ref's `current` is still null on the first
 *   render, and Portal throws on a missing container rather than render
 *   nothing.
 *
 * Not exported from the barrel: mount it by importing this file directly.
 */
export const PortalExample: React.FC = () => {
    const [clicks, setClicks] = useState(0);
    const [target, setTarget] = useState<HTMLElement | null>(null);

    const handleBoxClick = () => {
        setClicks(count => count + 1);
    };

    return (
        <section className={styles.example}>
            <h2 className={styles.title}>Portal example</h2>

            <h3 className={styles.label}>out of a clipped box, into body</h3>
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- the handler only counts events bubbling from the portal */}
            <div
                className={styles.clipped}
                onClick={handleBoxClick}
            >
                <p>This box has overflow: hidden. Clicks counted: {clicks}</p>
                <Portal>
                    <button
                        type="button"
                        className={styles.note}
                    >
                        In body: click me
                    </button>
                </Portal>
            </div>

            <h3 className={styles.label}>into a container of your own</h3>
            <div
                ref={setTarget}
                className={styles.target}
            />
            {target !== null && (
                <Portal container={target}>
                    <p>Rendered into the target above.</p>
                </Portal>
            )}
        </section>
    );
};

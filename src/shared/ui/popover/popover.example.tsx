import * as Popover from "./popover";

import styles from "./popover.example.module.css";

const ACTIONS = ["Rename", "Duplicate", "Archive"];

/**
 * A panel hung off its button, and the checks a unit test cannot make:
 *
 * - Open the first panel: it sits under the button, lined up with its end.
 *   A tap outside, Escape, or opening the second panel closes it.
 * - A screen reader announces the button as expanded while the panel is
 *   open; nothing in the code sets aria-expanded, popovertarget does.
 * - Close inside the panel closes it, and focus goes back to the button.
 * - The list panel is a `<ul>`: its items are read as a list of three.
 * - The manual panel stays open through taps outside and Escape until its
 *   own Close is pressed.
 * - With reduced motion the panels appear without the fade.
 *
 * Not exported from the barrel: mount it by importing this file directly.
 */
export const PopoverExample: React.FC = () => (
    <section className={styles.example}>
        <h2 className={styles.title}>Popover example</h2>

        <div className={styles.row}>
            <Popover.Root>
                <Popover.Trigger>Details</Popover.Trigger>
                <Popover.Content className={styles.panel}>
                    <p>Light dismiss: a tap outside or Escape closes it.</p>
                    <Popover.Close>Close</Popover.Close>
                </Popover.Content>
            </Popover.Root>

            <Popover.Root>
                <Popover.Trigger>Actions</Popover.Trigger>
                <Popover.Content
                    as="ul"
                    anchor={{ align: "start" }}
                    className={styles.panel}
                >
                    {ACTIONS.map(action => (
                        <li key={action}>{action}</li>
                    ))}
                </Popover.Content>
            </Popover.Root>

            <Popover.Root>
                <Popover.Trigger>Manual</Popover.Trigger>
                <Popover.Content
                    popover="manual"
                    anchor={{ side: "block-start" }}
                    className={styles.panel}
                >
                    <p>Stays until closed.</p>
                    <Popover.Close>Close</Popover.Close>
                </Popover.Content>
            </Popover.Root>
        </div>
    </section>
);

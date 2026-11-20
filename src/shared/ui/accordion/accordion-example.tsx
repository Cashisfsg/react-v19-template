import * as Accordion from "./accordion";

import styles from "./accordion-example.module.css";

/**
 * How the parts fit together, and the checks a unit test cannot make:
 *
 * - Open an item in the first group: the open one closes. In the second group
 *   both stay open.
 * - Tab to a trigger and press Enter or Space: it toggles, with no script.
 * - With every item shut, search the page for "hidden": the browser opens the
 *   item that holds it.
 * - Turn on reduced motion in the OS: the panel appears without animating.
 * - In Safari and Firefox, a shut panel must not paint over the next item.
 *
 * The marker is hidden in every engine, so the trigger draws its own.
 *
 * Not exported from the barrel: mount it by importing this file directly.
 */
export const AccordionExample: React.FC = () => (
    <section className={styles.example}>
        <h2 className={styles.title}>Accordion example</h2>

        <h3 className={styles.label}>single: one item open at a time</h3>
        <Accordion.Root>
            <Accordion.Item className={styles.item}>
                <Accordion.Trigger className={styles.trigger}>
                    What is it built on?
                </Accordion.Trigger>
                <Accordion.Content className={styles.content}>
                    A native details element, grouped by its name attribute.
                </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item className={styles.item}>
                <Accordion.Trigger className={styles.trigger}>
                    Can the content be a list?
                </Accordion.Trigger>
                <Accordion.Content
                    as="ul"
                    className={styles.content}
                >
                    <li>Content renders a div by default.</li>
                    <li>
                        Pass as=&quot;ul&quot;, &quot;form&quot; or any other
                        element.
                    </li>
                </Accordion.Content>
            </Accordion.Item>
        </Accordion.Root>

        <h3 className={styles.label}>multiple: each item on its own</h3>
        <Accordion.Root type="multiple">
            <Accordion.Item className={styles.item}>
                <Accordion.Trigger className={styles.trigger}>
                    First
                </Accordion.Trigger>
                <Accordion.Content className={styles.content}>
                    Stays open when the second one opens.
                </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item className={styles.item}>
                <Accordion.Trigger className={styles.trigger}>
                    Second
                </Accordion.Trigger>
                <Accordion.Content className={styles.content}>
                    This hidden sentence is what in-page search should find.
                </Accordion.Content>
            </Accordion.Item>
        </Accordion.Root>
    </section>
);

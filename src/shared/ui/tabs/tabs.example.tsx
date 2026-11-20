import { useState } from "react";

import * as Tabs from "./tabs-namespace";

import styles from "./tabs.example.module.css";

const SECTIONS = ["overview", "activity", "settings"] as const;

/**
 * The three ways to hold the current tab, and the checks a unit test cannot
 * make:
 *
 * - Arrow keys move between the triggers of one strip and wrap; Home and End
 *   jump to the ends. Tab leaves the strip and lands in the panel.
 * - On a touch screen a tab switches when the finger lands, not when it lifts.
 * - A trigger that is half out of view scrolls to the centre when chosen.
 * - Type in the Notes panel, switch away and back: the text is still there,
 *   because hidden panels are kept by `Activity`, not unmounted.
 * - The address strip writes `?section=` as it changes, without new history
 *   entries: reload and it opens on the same tab, press back and it leaves
 *   the page.
 * - Two strips with the same values do not mix: each trigger controls the
 *   panel of its own strip.
 *
 * Not exported from the barrel: mount it by importing this file directly.
 */
export const TabsExample: React.FC = () => {
    const [controlled, setControlled] = useState("2");

    const handleResetClick = () => {
        setControlled("1");
    };

    return (
        <section className={styles.example}>
            <h2 className={styles.title}>Tabs example</h2>

            <h3 className={styles.label}>uncontrolled, panels keep state</h3>
            <Tabs.Root defaultValue="1">
                <Tabs.List aria-label="Uncontrolled">
                    <Tabs.Trigger value="1">Notes</Tabs.Trigger>
                    <Tabs.Trigger value="2">Preview</Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="1">
                    <textarea
                        aria-label="Notes"
                        className={styles.notes}
                    />
                </Tabs.Content>
                <Tabs.Content value="2">
                    {isPending =>
                        isPending ? (
                            <p>Switching…</p>
                        ) : (
                            <p>Nothing to preview.</p>
                        )
                    }
                </Tabs.Content>
            </Tabs.Root>

            <div className={styles.header}>
                <h3 className={styles.label}>controlled, same values</h3>
                <button
                    type="button"
                    onClick={handleResetClick}
                >
                    Back to first
                </button>
            </div>
            <Tabs.Root
                value={controlled}
                onValueChange={setControlled}
            >
                <Tabs.List aria-label="Controlled">
                    <Tabs.Trigger value="1">First</Tabs.Trigger>
                    <Tabs.Trigger value="2">Second</Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="1">First panel</Tabs.Content>
                <Tabs.Content value="2">Second panel</Tabs.Content>
            </Tabs.Root>

            <h3 className={styles.label}>kept in the address, many tabs</h3>
            <Tabs.UrlRoot
                values={SECTIONS}
                param="section"
            >
                <Tabs.List
                    aria-label="Kept in the address"
                    className={styles.narrow}
                >
                    {SECTIONS.map(section => (
                        <Tabs.Trigger
                            key={section}
                            value={section}
                            className={styles.trigger}
                        >
                            {section}
                        </Tabs.Trigger>
                    ))}
                </Tabs.List>
                {SECTIONS.map(section => (
                    <Tabs.Content
                        key={section}
                        value={section}
                    >
                        The {section} panel.
                    </Tabs.Content>
                ))}
            </Tabs.UrlRoot>
        </section>
    );
};

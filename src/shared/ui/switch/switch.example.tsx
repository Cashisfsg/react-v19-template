import { useId, useState } from "react";

import { Switch } from "./switch";

import styles from "./switch.example.module.css";

/**
 * How the switch is wired, and the checks a unit test cannot make:
 *
 * - Tab to a switch and press Space or Enter: it toggles.
 * - The aria-disabled switch stays in the tab order and is announced as
 *   unavailable, but neither click nor key toggles it; the disabled one is
 *   skipped by Tab.
 * - With a mouse, hovering shows a halo around the thumb; on a touch screen it
 *   does not. Pressing dips the thumb, except on the two unavailable switches.
 * - In the right-to-left row, the thumb starts on the right.
 * - Turn on reduced motion in the OS: the thumb jumps instead of sliding.
 *
 * Every switch needs an accessible name: a <label> pointing at it, or
 * aria-label when there is no visible text.
 *
 * Not exported from the barrel: mount it by importing this file directly.
 */
export const SwitchExample: React.FC = () => {
    const id = useId();
    const [notifications, setNotifications] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const handleNotificationsChange = (checked: boolean) => {
        setNotifications(checked);
    };

    const handleSavingClick = () => {
        setIsSaving(saving => !saving);
    };

    return (
        <section className={styles.example}>
            <h2 className={styles.title}>Switch example</h2>

            <h3 className={styles.label}>controlled, with a visible label</h3>
            <div className={styles.row}>
                <label htmlFor={`${id}-notifications`}>Notifications</label>
                <Switch
                    id={`${id}-notifications`}
                    checked={notifications}
                    onCheckedChange={handleNotificationsChange}
                />
                <output htmlFor={`${id}-notifications`}>
                    {notifications ? "on" : "off"}
                </output>
            </div>

            <h3 className={styles.label}>variants, on by default</h3>
            <div className={styles.row}>
                <Switch
                    aria-label="Primary"
                    defaultChecked
                />
                <Switch
                    aria-label="Secondary"
                    variant="secondary"
                    defaultChecked
                />
                <Switch
                    aria-label="Danger"
                    variant="danger"
                    defaultChecked
                />
            </div>

            <h3 className={styles.label}>sizes and orientation</h3>
            <div className={styles.row}>
                <Switch
                    aria-label="Small"
                    size="sm"
                />
                <Switch aria-label="Medium" />
                <Switch
                    aria-label="Large"
                    size="lg"
                />
                <Switch
                    aria-label="Vertical"
                    orientation="vertical"
                />
            </div>

            <h3 className={styles.label}>unavailable</h3>
            <div className={styles.row}>
                <Switch
                    aria-label="Busy while saving"
                    aria-disabled={isSaving}
                    defaultChecked
                />
                <button
                    type="button"
                    onClick={handleSavingClick}
                >
                    {isSaving ? "Finish saving" : "Start saving"}
                </button>
                <Switch
                    aria-label="Disabled"
                    disabled
                />
            </div>

            <h3 className={styles.label}>right to left</h3>
            <div
                className={styles.row}
                dir="rtl"
            >
                <Switch aria-label="Right to left" />
            </div>
        </section>
    );
};

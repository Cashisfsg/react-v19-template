import { useState } from "react";

import { ActionButton } from "./action-button";

import styles from "./action-button.example.module.css";

const SAVE_DURATION = 2000;

/**
 * A form whose save takes two seconds, and the checks a unit test cannot
 * make:
 *
 * - Press Save: the label fades into a turning spinner and the button keeps
 *   its width; it fades back when the save ends.
 * - Focus stays on the button through the save, and a screen reader keeps
 *   its name, "Save", announced as unavailable.
 * - Pressing again or Enter during the save sends nothing: the counter
 *   counts one save per press that was let through.
 * - Under reduced motion there is no fade, and the spinner turns slower.
 *
 * Not exported from the barrel: mount it by importing this file directly.
 */
export const ActionButtonExample: React.FC = () => {
    const [isSaving, setIsSaving] = useState(false);
    const [saves, setSaves] = useState(0);

    const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = event => {
        event.preventDefault();
        setIsSaving(true);
        setSaves(count => count + 1);
        setTimeout(() => {
            setIsSaving(false);
        }, SAVE_DURATION);
    };

    return (
        <section className={styles.example}>
            <h3 className={styles.title}>Action button example</h3>

            <form
                className={styles.form}
                onSubmit={handleSubmit}
            >
                <ActionButton
                    type="submit"
                    variant="primary"
                    isLoading={isSaving}
                >
                    Save
                </ActionButton>
                <output>Saves sent: {saves}</output>
            </form>
        </section>
    );
};

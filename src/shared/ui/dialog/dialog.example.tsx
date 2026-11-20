import { useEffect, useState } from "react";

import * as Dialog from "./dialog";

import styles from "./dialog.example.module.css";

const DraftBody: React.FC = () => {
    const [draft, setDraft] = useState("");
    const [openCount, setOpenCount] = useState(0);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- counts how often Activity re-runs the effect, which is what the example shows
        setOpenCount(count => count + 1);
    }, []);

    const handleDraftChange: React.ChangeEventHandler<
        HTMLTextAreaElement
    > = event => {
        setDraft(event.target.value);
    };

    return (
        <>
            <h4 className={styles.heading}>Draft</h4>
            <label className={styles.field}>
                Type something, close and open again
                <textarea
                    value={draft}
                    onChange={handleDraftChange}
                />
            </label>
            <p>Effect runs: {openCount}</p>
        </>
    );
};

/**
 * The ways a dialog opens and closes, and the checks a unit test cannot make:
 *
 * - Open A and Open B: both triggers say expanded while it is open, and focus
 *   goes back to the one that opened it on close.
 * - The rest of the page is inert and does not scroll under a modal.
 * - Type a draft, close, open again: the text is still there, and the effect
 *   counter goes up, because Activity keeps state but stops effects.
 * - A tap on the backdrop closes the first dialog; a tap inside its padding
 *   does not. Escape closes it too.
 * - The locked dialog ignores the backdrop and Escape, even in a browser
 *   without `closedby`; only its buttons close it.
 * - The cross is announced as "Close". Done closes through requestClose,
 *   so it fires `cancel` first, as Escape does.
 * - The non-modal dialog leaves the page usable and has no backdrop.
 * - With reduced motion nothing fades or rises.
 *
 * Not exported from the barrel: mount it by importing this file directly.
 */
export const DialogExample: React.FC = () => (
    <section className={styles.example}>
        <h3 className={styles.title}>Dialog example</h3>

        <div className={styles.row}>
            <Dialog.Root>
                <Dialog.Trigger>Open A</Dialog.Trigger>
                <Dialog.Trigger>Open B</Dialog.Trigger>
                <Dialog.Content
                    motion="rise"
                    className={styles.panel}
                >
                    <Dialog.Close className={styles.corner} />
                    <DraftBody />
                    <Dialog.Close command="request-close">Done</Dialog.Close>
                </Dialog.Content>
            </Dialog.Root>

            <Dialog.Root>
                <Dialog.Trigger>Locked</Dialog.Trigger>
                <Dialog.Content
                    closedby="none"
                    className={styles.panel}
                >
                    <h4 className={styles.heading}>Discard the draft?</h4>
                    <p>Only the buttons close this one.</p>
                    <div className={styles.actions}>
                        <Dialog.Close>Keep</Dialog.Close>
                        <Dialog.Close>Discard</Dialog.Close>
                    </div>
                </Dialog.Content>
            </Dialog.Root>

            <Dialog.Root>
                <Dialog.Trigger command="show">Non-modal</Dialog.Trigger>
                <Dialog.Content className={styles.panel}>
                    <p>The page behind stays usable.</p>
                    <Dialog.Close>Close</Dialog.Close>
                </Dialog.Content>
            </Dialog.Root>
        </div>
    </section>
);

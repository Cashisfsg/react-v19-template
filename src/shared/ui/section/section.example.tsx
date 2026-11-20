import { useState } from "react";

import * as Section from "./section";

import styles from "./section.example.module.css";

/**
 * How a section gets its name and description, and the checks a unit test
 * cannot make:
 *
 * - In the accessibility tree the first block is a region named "Shipping"
 *   and described by its paragraph. Without a Label it would be no region.
 * - Show the note: the description grows to both paragraphs, in the order they
 *   appear on screen, even though the note mounted last. Hide it and only the
 *   first is left.
 * - The article is named by its own heading and the page heading above it,
 *   passed in through aria-labelledby, in that order.
 * - Rename the heading's id with "Own id": the label keeps the id it was
 *   given and the region's aria-labelledby follows it.
 * - The server HTML has no aria-labelledby on either block: the references
 *   are written after the parts mount, so they appear once the page hydrates.
 *
 * Not exported from the barrel: mount it by importing this file directly.
 */
export const SectionExample: React.FC = () => {
    const [showNote, setShowNote] = useState(false);
    const [ownId, setOwnId] = useState<string | undefined>(undefined);

    const handleNoteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setShowNote(event.currentTarget.checked);
    };

    const handleOwnIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setOwnId(event.currentTarget.checked ? "shipping-heading" : undefined);
    };

    return (
        <section className={styles.example}>
            <h3
                id="section-example-title"
                className={styles.title}
            >
                Section example
            </h3>

            <div className={styles.controls}>
                <label>
                    <input
                        type="checkbox"
                        checked={showNote}
                        onChange={handleNoteChange}
                    />
                    Show the note
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={ownId !== undefined}
                        onChange={handleOwnIdChange}
                    />
                    Own id
                </label>
            </div>

            <Section.Root className={styles.block}>
                <Section.Label
                    as="h4"
                    id={ownId}
                >
                    Shipping
                </Section.Label>
                <Section.Description>
                    Orders leave the warehouse within two days.
                </Section.Description>
                <p>Free over 50 €.</p>
                {showNote && (
                    <Section.Description>
                        Holidays add a day.
                    </Section.Description>
                )}
            </Section.Root>

            <Section.Root
                as="article"
                aria-labelledby="section-example-title"
                className={styles.block}
            >
                <Section.Label as="h4">Returns</Section.Label>
                <p>Thirty days, no questions.</p>
            </Section.Root>
        </section>
    );
};

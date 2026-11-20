import { useId } from "react";

import * as Anchor from "./anchor";

import styles from "./anchor.example.module.css";

import type { AnchorPlacement } from "./use-anchor-placement";

const PLACEMENTS: { label: string; placement: AnchorPlacement }[] = [
    { label: "Below, end", placement: {} },
    { label: "Below, start", placement: { align: "start" } },
    { label: "Above, end", placement: { side: "block-start" } },
    {
        label: "Above, start",
        placement: { side: "block-start", align: "start" }
    }
];

interface AnchoredPopoverProps {
    label: string;
    placement: AnchorPlacement;
}

const AnchoredPopover: React.FC<AnchoredPopoverProps> = ({
    label,
    placement
}) => {
    const popoverId = useId();

    return (
        <Anchor.Root>
            <Anchor.Target
                type="button"
                popoverTarget={popoverId}
            >
                {label}
            </Anchor.Target>
            <Anchor.Positioned
                id={popoverId}
                popover="auto"
                placement={placement}
                className={styles.panel}
            >
                Anchored {label.toLowerCase()}.
            </Anchor.Positioned>
        </Anchor.Root>
    );
};

/**
 * Where a panel goes by its anchor, and the checks a unit test cannot make:
 *
 * - Open each button: the panel sits on its side and lines up with the
 *   stated edge of the button, 0.25rem away.
 * - Scroll so a button is near the bottom, then open a Below panel: it flips
 *   above. Near the right edge an end-aligned panel stays on screen.
 * - With the page in right-to-left, start and end swap sides.
 * - In a browser without anchor positioning (or with it turned off in
 *   devtools), the panels land in the same places, placed by JS, and follow
 *   the button while the page scrolls.
 * - Two instances on one page never share an anchor: each panel opens by its
 *   own button.
 *
 * Not exported from the barrel: mount it by importing this file directly.
 */
export const AnchorExample: React.FC = () => (
    <section className={styles.example}>
        <h3 className={styles.title}>Anchor example</h3>

        <div className={styles.row}>
            {PLACEMENTS.map(({ label, placement }) => (
                <AnchoredPopover
                    key={label}
                    label={label}
                    placement={placement}
                />
            ))}
        </div>
    </section>
);

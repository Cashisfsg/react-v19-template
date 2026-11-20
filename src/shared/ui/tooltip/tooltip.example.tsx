import { useState } from "react";

import { Popover } from "~/shared/ui/popover";

import * as Tooltip from "./tooltip";

import styles from "./tooltip.example.module.css";

/**
 * What a tooltip does around its trigger, and the checks a unit test cannot
 * make:
 *
 * - Hover Save: the tooltip opens after a second, above the button. Move the
 *   pointer onto it: it stays. Leave both: it closes half a second later.
 * - Tab to a button: its tooltip opens; Tab away and it closes at once.
 *   Escape closes it while hovered or focused, in browsers with and without
 *   popover="hint".
 * - A screen reader reads the tooltip as the button's description and does
 *   not call the button expanded or collapsed.
 * - Click Save: the counter goes up and the tooltip closes; a click never
 *   toggles the tooltip.
 * - On a touch screen a tap saves and no tooltip appears.
 * - Scroll so Save sits at the top of the viewport: its tooltip flips below.
 * - Open Menu, then hover Save: the menu stays open under the tooltip. An
 *   `auto` tooltip would have closed it; `hint` does not, and neither does
 *   `manual`, which older browsers fall back to.
 *
 * Not exported from the barrel: mount it by importing this file directly.
 */
export const TooltipExample: React.FC = () => {
    const [saved, setSaved] = useState(0);

    const handleSaveClick = () => {
        setSaved(count => count + 1);
    };

    return (
        <section className={styles.example}>
            <h3 className={styles.title}>Tooltip example</h3>

            <div className={styles.row}>
                <Tooltip.Root>
                    <Tooltip.Trigger onClick={handleSaveClick}>
                        Save ({saved})
                    </Tooltip.Trigger>
                    <Tooltip.Content className={styles.tooltip}>
                        Saves the draft. Ctrl+S does the same.
                    </Tooltip.Content>
                </Tooltip.Root>

                <Tooltip.Root>
                    <Tooltip.Trigger>Below, start</Tooltip.Trigger>
                    <Tooltip.Content
                        placement={{ side: "block-end", align: "start" }}
                        className={styles.tooltip}
                    >
                        Under the trigger, lined up with its start.
                    </Tooltip.Content>
                </Tooltip.Root>

                <Popover.Root>
                    <Popover.Trigger>Menu</Popover.Trigger>
                    <Popover.Content className={styles.menu}>
                        An open popover, to hover a tooltip over.
                    </Popover.Content>
                </Popover.Root>
            </div>
        </section>
    );
};

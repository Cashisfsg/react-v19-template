import { Button } from "./button";

import styles from "./button.example.module.css";

import type { ButtonVariant } from "./button-variants";

const VARIANTS: readonly ButtonVariant[] = [
    "primary",
    "secondary",
    "transparent",
    "danger",
    "cancel"
];

/**
 * Every variant, rounded and disabled, and the checks a unit test cannot
 * make:
 *
 * - Tab reaches every button but the disabled ones, and a ring shows only
 *   for the keyboard, off the button's edge.
 * - A press dips the button a little; a disabled one does not dip.
 * - Hover changes the fill only with a fine pointer.
 * - Under reduced motion nothing transitions.
 *
 * Not exported from the barrel: mount it by importing this file directly.
 */
export const ButtonExample: React.FC = () => (
    <section className={styles.example}>
        <h3 className={styles.title}>Button example</h3>

        <div className={styles.row}>
            {VARIANTS.map(variant => (
                <Button
                    key={variant}
                    variant={variant}
                >
                    {variant}
                </Button>
            ))}
        </div>

        <div className={styles.row}>
            <Button
                variant="primary"
                rounded
            >
                Rounded
            </Button>
            <Button
                variant="primary"
                disabled
            >
                Disabled
            </Button>
            <Button className={styles.custom}>Own classes</Button>
        </div>
    </section>
);

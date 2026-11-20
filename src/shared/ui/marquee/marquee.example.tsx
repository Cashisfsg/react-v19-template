import { useId, useState } from "react";

import * as Marquee from "./marquee";

import styles from "./marquee.example.module.css";

const PARTNERS = ["React", "Vite", "TypeScript", "React Router", "Stylelint"];

/**
 * How the strip is named and paused, and the checks a unit test cannot make:
 *
 * - Tab through the first strip: each link is reached once. The copy that
 *   closes the loop is inert, so Tab skips it.
 * - The Pause button stops the strip and Play starts it again. Hovering or
 *   focusing a link pauses it too, but only while the pointer or focus stays.
 * - A screen reader announces a marquee with its name and one list of five,
 *   not ten, and does not read the motion aloud.
 * - Turn on reduced motion in the OS: both strips stand still, the copy is
 *   gone, and the items scroll sideways by hand.
 * - The right-to-left strip moves the other way.
 *
 * Not exported from the barrel: mount it by importing this file directly.
 */
export const MarqueeExample: React.FC = () => {
    const headingId = useId();
    const [paused, setPaused] = useState(false);

    const handlePauseClick = () => {
        setPaused(isPaused => !isPaused);
    };

    return (
        <section className={styles.example}>
            <h3 className={styles.title}>Marquee example</h3>

            <div className={styles.header}>
                <h4
                    id={headingId}
                    className={styles.label}
                >
                    Built with, named by this heading
                </h4>
                <button
                    type="button"
                    onClick={handlePauseClick}
                >
                    {paused ? "Play" : "Pause"}
                </button>
            </div>
            <Marquee.Root
                aria-labelledby={headingId}
                paused={paused}
            >
                <Marquee.List>
                    {PARTNERS.map(name => (
                        <Marquee.Item key={name}>
                            <a href={`#${name}`}>{name}</a>
                        </Marquee.Item>
                    ))}
                </Marquee.List>
            </Marquee.Root>

            <h4 className={styles.label}>
                aria-label, faster, wider gap, right to left
            </h4>
            <Marquee.Root
                aria-label="Announcements"
                className={styles.fast}
                dir="rtl"
            >
                <Marquee.List>
                    <Marquee.Item>Free shipping this week</Marquee.Item>
                    <Marquee.Item>New colours in stock</Marquee.Item>
                    <Marquee.Item>Support replies within a day</Marquee.Item>
                </Marquee.List>
            </Marquee.Root>
        </section>
    );
};

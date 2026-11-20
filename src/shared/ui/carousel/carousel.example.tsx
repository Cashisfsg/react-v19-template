import * as Carousel from "./carousel";

import styles from "./carousel.example.module.css";

const SLIDES = [
    { id: "dawn", title: "Dawn", tone: "#f9c58d" },
    { id: "noon", title: "Noon", tone: "#8dd3f9" },
    { id: "dusk", title: "Dusk", tone: "#c58df9" },
    { id: "night", title: "Night", tone: "#8d9cf9" }
] as const;

/**
 * Four slides, each 80% of the row so the next one peeks in, and the
 * checks a unit test cannot make:
 *
 * - Swipe, scroll with a trackpad or drag the scrollbar: the row snaps to a
 *   slide, and the dot under it fills.
 * - On the first slide "Previous slide" is dim, announced as unavailable,
 *   and pressing it keeps the focus on it. The same for "Next" on the last.
 * - Tab to the dots, then the arrow keys, Home and End: the focus moves and
 *   the slide follows. Only one dot is a Tab stop.
 * - Tab from the dots back into the row: only the slide in view takes the
 *   focus (the "Read" link), never one scrolled away.
 * - A screen reader says "carousel" on entry, and "2 of 4" when a slide
 *   comes into view, but nothing on load.
 * - With reduced motion on in the system, the row jumps instead of gliding.
 * - Under `dir="rtl"` the slides run right to left and the arrows flip.
 *
 * Not exported from the barrel: mount it by importing this file directly.
 */
export const CarouselExample: React.FC = () => (
    <section className={styles.example}>
        <h3 className={styles.title}>Carousel example</h3>

        <Carousel.Root
            aria-label="Times of day"
            className={styles.peek}
        >
            {SLIDES.map(slide => (
                <Carousel.Item key={slide.id}>
                    <figure
                        className={styles.slide}
                        style={{ "--tone": slide.tone } as React.CSSProperties}
                    >
                        <figcaption>
                            {slide.title} <a href={`#${slide.id}`}>Read</a>
                        </figcaption>
                    </figure>
                </Carousel.Item>
            ))}
        </Carousel.Root>
    </section>
);

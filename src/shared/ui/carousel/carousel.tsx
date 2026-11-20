import {
    Children,
    isValidElement,
    useEffect,
    useId,
    useRef,
    useState
} from "react";

import { DEFAULT_LABELS, type CarouselLabels } from "./labels";
import {
    CarouselItemContext,
    useCarouselItemContext
} from "./use-carousel-context";

import styles from "./carousel.module.css";

const ITEM_ATTRIBUTE = "data-carousel-item";

/* As in Adam Argyle's carousel: a slide is the current one once 60% of it
   is in the scrollport, which leaves exactly one at a time. */
const CURRENT_THRESHOLD = 0.6;

/* `inline: "center"` lands on the snap point, in either direction of text,
   and the scroller's `scroll-behavior` decides whether it glides. */
const reveal = (item: Element | undefined, behavior?: ScrollBehavior) => {
    item?.scrollIntoView({
        block: "nearest",
        inline: "center",
        ...(behavior === undefined ? {} : { behavior })
    });
};

interface RootProps extends Omit<
    React.ComponentProps<"section">,
    "aria-roledescription"
> {
    /** The carousel's name: it is a landmark of its own. */
    "aria-label": string;
    /** The slide shown first, counted from 0. */
    defaultIndex?: number | undefined;
    labels?: Partial<CarouselLabels> | undefined;
}

/**
 * A row of slides that scrolls and snaps, with Previous and Next and a
 * picker per slide.
 *
 * After Adam Argyle's GUI challenge carousel: the scrolling is CSS
 * scroll-snap, so a swipe, a trackpad and a scrollbar all work without
 * script, and an IntersectionObserver tells which slide is current. The
 * roles are the WAI-ARIA carousel pattern's tabbed variant: the pickers are
 * tabs, each slide the tab panel it controls, named "2 of 5" and marked
 * `aria-roledescription="slide"`. The slides out of view are `inert`, so
 * Tab never lands in one.
 *
 * Previous and Next refuse at the ends through `aria-disabled`, keeping the
 * focus where it is, and a status region reads out the slide that comes
 * into view. The pickers take the arrow keys, Home and End, and show the
 * slide as the focus moves.
 *
 * Every direct child is a slide and should be a `Carousel.Item`.
 *
 * https://www.w3.org/WAI/ARIA/apg/patterns/carousel/
 * https://github.com/argyleink/gui-challenges/tree/main/carousel
 */
export const Root: React.FC<RootProps> = ({
    "aria-label": label,
    defaultIndex = 0,
    labels: ownLabels,
    className = "",
    children,
    ...props
}) => {
    const labels = { ...DEFAULT_LABELS, ...ownLabels };
    const baseId = useId();
    const scrollerRef = useRef<HTMLDivElement>(null);
    const slides = Children.toArray(children).filter(isValidElement);
    const total = slides.length;

    const [current, setCurrent] = useState(() =>
        Math.min(Math.max(defaultIndex, 0), Math.max(total - 1, 0))
    );
    /* Empty until the reader moves: a region filled on load would read the
       first slide over whatever the page announces. */
    const [announcement, setAnnouncement] = useState("");
    const startRef = useRef(current);

    const items = () =>
        Array.from(
            scrollerRef.current?.querySelectorAll(
                `:scope > [${ITEM_ATTRIBUTE}]`
            ) ?? []
        );

    useEffect(() => {
        const scroller = scrollerRef.current;
        if (scroller === null) return;

        /* The first slide without a glide, before anyone sees the row. */
        if (startRef.current > 0) reveal(items()[startRef.current], "instant");

        const observer = new IntersectionObserver(
            entries => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    const index = Number(
                        entry.target.getAttribute(ITEM_ATTRIBUTE)
                    );
                    setCurrent(index);
                }
            },
            { root: scroller, threshold: CURRENT_THRESHOLD }
        );
        for (const item of items()) observer.observe(item);

        return () => {
            observer.disconnect();
        };
    }, [total]);

    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        setAnnouncement(labels.slide(current + 1, total));
        // eslint-disable-next-line react-hooks/exhaustive-deps -- read out on a change of slide, not of the caller's label functions
    }, [current, total]);

    const goTo = (index: number) => {
        reveal(items()[index]);
    };

    const handleStep: React.MouseEventHandler<HTMLButtonElement> = event => {
        const button = event.currentTarget;
        if (button.getAttribute("aria-disabled") === "true") return;
        goTo(button.dataset.step === "next" ? current + 1 : current - 1);
    };

    const handleTabClick: React.MouseEventHandler<
        HTMLButtonElement
    > = event => {
        goTo(Number(event.currentTarget.dataset.index));
    };

    /* The tabs pattern with automatic activation: the arrow moves the focus
       and the slide follows. Left and Right are swapped in right-to-left
       text, where the next slide lies to the left. */
    const handleTabKeyDown: React.KeyboardEventHandler<
        HTMLButtonElement
    > = event => {
        const tablist = event.currentTarget.parentElement;
        if (tablist === null) return;
        const isRtl = getComputedStyle(tablist).direction === "rtl";
        const forward = isRtl ? "ArrowLeft" : "ArrowRight";
        const backward = isRtl ? "ArrowRight" : "ArrowLeft";

        let index: number;
        switch (event.key) {
            case forward:
                index = Math.min(current + 1, total - 1);
                break;
            case backward:
                index = Math.max(current - 1, 0);
                break;
            case "Home":
                index = 0;
                break;
            case "End":
                index = total - 1;
                break;
            default:
                return;
        }

        event.preventDefault();
        tablist.querySelector<HTMLElement>(`[data-index="${index}"]`)?.focus();
        goTo(index);
    };

    const slideId = (index: number) => `${baseId}-slide-${index}`;
    const tabId = (index: number) => `${baseId}-tab-${index}`;
    const scrollerId = `${baseId}-slides`;

    return (
        <section
            {...props}
            aria-label={label}
            aria-roledescription="carousel"
            className={`${styles.carousel} ${className}`.trim()}
        >
            <button
                type="button"
                aria-label={labels.previous}
                aria-controls={scrollerId}
                aria-disabled={current === 0 || undefined}
                data-step="previous"
                className={`${styles.control} ${styles.previous}`}
                onClick={handleStep}
            >
                <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                    focusable="false"
                >
                    <path d="M12.707 5.293a1 1 0 0 1 0 1.414L9.414 10l3.293 3.293a1 1 0 0 1-1.414 1.414l-4-4a1 1 0 0 1 0-1.414l4-4a1 1 0 0 1 1.414 0z" />
                </svg>
            </button>

            <div
                id={scrollerId}
                className={styles.scroller}
                ref={scrollerRef}
            >
                {slides.map((slide, index) => (
                    <CarouselItemContext
                        key={slide.key ?? index}
                        value={{
                            index,
                            total,
                            isCurrent: index === current,
                            slideId: slideId(index),
                            tabId: tabId(index),
                            label: labels.slide(index + 1, total)
                        }}
                    >
                        {slide}
                    </CarouselItemContext>
                ))}
            </div>

            <button
                type="button"
                aria-label={labels.next}
                aria-controls={scrollerId}
                aria-disabled={current === total - 1 || undefined}
                data-step="next"
                className={`${styles.control} ${styles.next}`}
                onClick={handleStep}
            >
                <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                    focusable="false"
                >
                    <path d="M7.293 14.707a1 1 0 0 1 0-1.414L10.586 10 7.293 6.707a1 1 0 0 1 1.414-1.414l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0z" />
                </svg>
            </button>

            <div
                role="tablist"
                aria-label={labels.pagination}
                className={styles.pagination}
            >
                {slides.map((slide, index) => (
                    <button
                        key={slide.key ?? index}
                        id={tabId(index)}
                        type="button"
                        role="tab"
                        aria-label={labels.tab(index + 1, total)}
                        aria-selected={index === current}
                        aria-controls={slideId(index)}
                        tabIndex={index === current ? 0 : -1}
                        data-index={index}
                        className={styles.tab}
                        onClick={handleTabClick}
                        onKeyDown={handleTabKeyDown}
                    />
                ))}
            </div>

            <div
                role="status"
                className={styles.status}
            >
                {announcement}
            </div>
        </section>
    );
};

Root.displayName = "Carousel.Root";

interface ItemProps extends Omit<
    React.ComponentProps<"div">,
    "id" | "role" | "aria-roledescription" | "aria-labelledby" | "inert"
> {}

/**
 * One slide: the tab panel its picker controls, named by its place. Out of
 * view it is `inert`, so neither Tab nor a screen reader's cursor lands in
 * it until it scrolls in.
 */
export const Item: React.FC<ItemProps> = ({ className = "", ...props }) => {
    const { index, isCurrent, slideId, label } = useCarouselItemContext();

    return (
        <div
            {...props}
            {...{ [ITEM_ATTRIBUTE]: index }}
            id={slideId}
            role="tabpanel"
            aria-roledescription="slide"
            aria-label={label}
            inert={!isCurrent}
            className={`${styles.item} ${className}`.trim()}
        />
    );
};

Item.displayName = "Carousel.Item";

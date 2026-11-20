import { type AnchorAlign, type AnchorSide, placePanel } from "./place";

interface FollowOptions {
    side: AnchorSide;
    align: AnchorAlign;
}

/**
 * Places the panel by its anchor now and again on every scroll, resize and
 * change of its own size, until stopped.
 */
export const follow = (
    panel: HTMLElement,
    anchor: HTMLElement,
    { side, align }: FollowOptions
) => {
    const place = () => {
        const { top, left, right, maxHeight } = placePanel(
            anchor.getBoundingClientRect(),
            {
                width: panel.offsetWidth,
                /* The full height rather than the box's, which a ceiling from
                   the last pass may be holding down. */
                height:
                    panel.scrollHeight + panel.offsetHeight - panel.clientHeight
            },
            {
                width: document.documentElement.clientWidth,
                height: window.innerHeight
            },
            { side, align, isRtl: getComputedStyle(panel).direction === "rtl" }
        );
        const px = (value: number | null) =>
            value === null ? "auto" : `${String(value)}px`;
        panel.style.setProperty(
            "inset",
            `${String(top)}px ${px(right)} auto ${px(left)}`
        );
        panel.style.setProperty(
            "max-block-size",
            maxHeight === null ? "" : `${String(maxHeight)}px`
        );
    };

    place();

    /* The panel's own size. The first pass runs on `beforetoggle`, while
       `Popover.Content` still has its items hidden, so it measures a nearly
       empty panel; this fires once they show, between layout and paint, and
       that frame is drawn already placed. */
    const observer = new ResizeObserver(place);
    observer.observe(panel);
    /* The anchor moving under any scrolling container, not only the document. */
    window.addEventListener("scroll", place, { capture: true, passive: true });
    /* The viewport changing while the panel does not: a rotation, a stretched
       window, a keyboard taking height. The room on each side and the inline
       offset change with it, and the observer above sees none of that. */
    window.addEventListener("resize", place);

    return () => {
        observer.disconnect();
        window.removeEventListener("scroll", place, { capture: true });
        window.removeEventListener("resize", place);
    };
};

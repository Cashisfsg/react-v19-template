/* The 0.25rem `anchor.module.css` keeps between the panel and its anchor, and
   the least room left between the panel and the screen edge. */
const GAP = 4;
const EDGE = 4;

/**
 * Which side of the anchor the panel opens on, before it flips for lack of
 * room.
 */
export type AnchorSide = "block-start" | "block-end";

/** Which inline edge of the anchor the panel lines up with. */
export type AnchorAlign = "start" | "end";

interface Box {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

interface Size {
    width: number;
    height: number;
}

interface Placement {
    top: number;
    /**
     * One inline edge, the other left `auto`. Pinning the edge the panel is
     * aligned by keeps its width from depending on its own offset: an
     * end-aligned panel given a `left` would have its room, and so its width,
     * change with every pass.
     */
    left: number | null;
    right: number | null;
    /**
     * Set when the panel fits on neither side and has to scroll inside what is
     * left.
     */
    maxHeight: number | null;
}

interface PlaceOptions {
    side: AnchorSide;
    align: AnchorAlign;
    isRtl: boolean;
}

/**
 * Where a panel goes without anchor positioning, by the rules
 * `anchor.module.css` states for it: on its side of the anchor and lined up
 * with the chosen edge, on the other side when there is no room, the other way
 * when it would run off the screen, and failing all that on whichever side has
 * more room.
 */
export const placePanel = (
    anchor: Box,
    panel: Size,
    viewport: Size,
    { side, align, isRtl }: PlaceOptions
): Placement => {
    const roomBelow = viewport.height - anchor.bottom - GAP - EDGE;
    const roomAbove = anchor.top - GAP - EDGE;
    const opensBelow =
        side === "block-end"
            ? panel.height <= roomBelow || roomBelow >= roomAbove
            : !(panel.height <= roomAbove || roomAbove >= roomBelow);
    const room = opensBelow ? roomBelow : roomAbove;
    const height = Math.min(panel.height, room);

    const byRight = { left: null, right: viewport.width - anchor.right };
    const byLeft = { left: anchor.left, right: null };
    const fitsByRight =
        anchor.right - panel.width >= EDGE &&
        anchor.right <= viewport.width - EDGE;
    const fitsByLeft =
        anchor.left >= EDGE &&
        anchor.left + panel.width <= viewport.width - EDGE;
    /* The inline end is the right in a left-to-right layout and the left
       otherwise. */
    const prefersRight = (align === "end") !== isRtl;
    const [preferred, other] = prefersRight
        ? [byRight, byLeft]
        : [byLeft, byRight];
    const [fitsPreferred, fitsOther] = prefersRight
        ? [fitsByRight, fitsByLeft]
        : [fitsByLeft, fitsByRight];
    /* Wider than either side allows: against the screen edge it would run off. */
    const pinned =
        anchor.right - panel.width < EDGE
            ? { left: EDGE, right: null }
            : { left: null, right: EDGE };
    const inline = fitsPreferred ? preferred : fitsOther ? other : pinned;

    return {
        top: opensBelow ? anchor.bottom + GAP : anchor.top - GAP - height,
        ...inline,
        maxHeight: panel.height > room ? room : null
    };
};

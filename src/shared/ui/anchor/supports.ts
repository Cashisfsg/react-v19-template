/* Every property the native path needs, not just the first: Chromium 125-128
   ships `position-anchor` while the other two were still `inset-area` and
   `position-try-options`, and would otherwise get neither placement. The one
   place this is asked: `anchor.module.css` keys its rules on the attribute set
   from the answer, so CSS and JS cannot disagree.
   https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning */
const ANCHORING =
    "(position-anchor: --probe) and (position-area: block-end) and (position-try-fallbacks: flip-block)";

export const supportsAnchoring = (): boolean => {
    const css = globalThis.CSS as typeof CSS | undefined;
    return css !== undefined && css.supports(ANCHORING);
};

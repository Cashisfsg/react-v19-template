import { useCallback, useEffect, useRef } from "react";

import { follow } from "./follow";
import { supportsAnchoring } from "./supports";

import type { AnchorAlign, AnchorSide } from "./place";

export interface AnchorPlacement {
    /** Defaults to `block-end`: under the anchor. */
    side?: AnchorSide | undefined;
    /** Defaults to `end`: lined up with the anchor's inline end. */
    align?: AnchorAlign | undefined;
    /**
     * `false` places the panel only where the engine anchors natively, and
     * leaves it to the caller's own styles everywhere else.
     */
    fallback?: boolean | undefined;
    /**
     * Anchored only while this media query matches; otherwise left to the
     * caller's own styles.
     */
    media?: string | undefined;
}

/* Matched by value rather than through a selector, so a generated name needs no
   escaping. */
const findAnchor = (name: string) =>
    Array.from(
        document.querySelectorAll<HTMLElement>("[data-anchor-target]")
    ).find(element => element.dataset.anchorTarget === name);

const unplace = (panel: HTMLElement) => {
    delete panel.dataset.anchor;
    delete panel.dataset.side;
    delete panel.dataset.align;
    panel.style.removeProperty("inset");
    panel.style.removeProperty("max-block-size");
};

const anchorWhileOpen = (
    panel: HTMLElement,
    name: string,
    {
        side = "block-end",
        align = "end",
        fallback = true,
        media
    }: AnchorPlacement
) => {
    let stopFollowing: (() => void) | null = null;
    const query = media === undefined ? null : window.matchMedia(media);

    const apply = () => {
        stopFollowing?.();
        stopFollowing = null;
        unplace(panel);
        if (query !== null && !query.matches) return;

        /* Looked for on both paths: a panel opened by `showPopover()` or from a
           button that holds no anchor would otherwise be pulled to a name that
           matches nothing on one engine and keep its own styles on the other. */
        const anchor = findAnchor(name);
        if (anchor === undefined) return;

        const isNative = supportsAnchoring();
        if (!isNative && !fallback) return;

        panel.dataset.anchor = isNative ? "native" : "js";
        panel.dataset.side = side;
        panel.dataset.align = align;
        if (isNative) return;
        stopFollowing = follow(panel, anchor, { side, align });
    };

    apply();
    query?.addEventListener("change", apply);

    /* The attributes and coordinates stay, so a panel that animates out leaves
       from where it stood. The next open sets them again. */
    return () => {
        stopFollowing?.();
        query?.removeEventListener("change", apply);
    };
};

/**
 * Started before the panel shows, or it would first be seen where its own
 * styles put it.
 */
export const useAnchorPlacement = (
    placement: AnchorPlacement | false,
    name: string
) => {
    const stop = useRef<(() => void) | null>(null);
    const side = placement === false ? undefined : placement.side;
    const align = placement === false ? undefined : placement.align;
    const fallback = placement === false ? undefined : placement.fallback;
    const media = placement === false ? undefined : placement.media;
    const isAnchored = placement !== false;

    useEffect(
        () => () => {
            stop.current?.();
        },
        []
    );

    return useCallback<React.ToggleEventHandler<HTMLElement>>(
        event => {
            stop.current?.();
            stop.current = null;
            if (event.newState !== "open") return;
            /* The last anchored open left its placement on, for the panel to
               leave from; a panel now placed by hand must not keep it. */
            if (!isAnchored) {
                unplace(event.currentTarget);
                return;
            }

            stop.current = anchorWhileOpen(event.currentTarget, name, {
                side,
                align,
                fallback,
                media
            });
        },
        [isAnchored, name, side, align, fallback, media]
    );
};

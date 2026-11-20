/** Which way the arrow keys run, as `aria-orientation` says. */
export type ListOrientation = "vertical" | "horizontal";

/**
 * Where a navigation key moves the active item, before it is clamped to the
 * list.
 */
type Step = "previous" | "next" | "first" | "last";

const STEP_KEYS: Readonly<
    Record<ListOrientation, Readonly<Record<string, Step>>>
> = {
    vertical: {
        ArrowUp: "previous",
        ArrowDown: "next",
        Home: "first",
        End: "last"
    },
    horizontal: {
        ArrowLeft: "previous",
        ArrowRight: "next",
        Home: "first",
        End: "last"
    }
};

export interface StepOptions {
    /** Past an end, go round to the other one rather than stop. */
    loop?: boolean;
    /** Whether Home and End jump to the ends. Off where they move a caret. */
    homeEnd?: boolean;
}

/**
 * The index a navigation key moves to, or `null` for a key that is not one.
 *
 * By default no wrap: the Listbox Pattern's arrows move to the next and the
 * previous item and stop at the ends, as a native list does. An editable
 * combobox goes round instead, as every APG editable example does. The arrows
 * across the orientation do nothing.
 */
export const stepIndex = (
    key: string,
    orientation: ListOrientation,
    from: number,
    count: number,
    { loop = false, homeEnd = true }: StepOptions = {}
): number | null => {
    const keys = STEP_KEYS[orientation];
    if (!Object.hasOwn(keys, key)) return null;

    const step = keys[key];
    if (!homeEnd && (step === "first" || step === "last")) return null;

    const last = count - 1;
    switch (step) {
        case "first":
            return 0;
        case "last":
            return last;
        case "previous":
            if (from === -1) return last;
            if (from > 0) return from - 1;
            return loop ? last : 0;
        default:
            if (from === -1) return 0;
            if (from < last) return from + 1;
            return loop ? 0 : last;
    }
};

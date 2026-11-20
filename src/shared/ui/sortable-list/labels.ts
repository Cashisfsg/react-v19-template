/** Every word the list says, for a page in another language to replace. */
export interface SortableListLabels {
    moveUp: (label: string) => string;
    moveDown: (label: string) => string;
    /** Read out after a move, by the item's new neighbours. */
    moved: (
        label: string,
        previous: string | undefined,
        next: string | undefined
    ) => string;
}

/* "Between X and Y" rather than a position number: GitHub found it the
   shortest sentence that still says where the item is, heard again and again
   in a long list. */
export const DEFAULT_LABELS: SortableListLabels = {
    moveUp: label => `Move ${label} up`,
    moveDown: label => `Move ${label} down`,
    moved: (label, previous, next) => {
        if (previous === undefined) return `${label} moved to the top`;
        if (next === undefined) return `${label} moved to the bottom`;
        return `${label} moved between ${previous} and ${next}`;
    }
};

/** A copy of `items` with the one at `from` taken out and put back at `to`. */
export const moveItem = <T>(items: readonly T[], from: number, to: number) => {
    const next = [...items];
    const [item] = next.splice(from, 1);
    if (item !== undefined) next.splice(to, 0, item);
    return next;
};

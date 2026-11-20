export const DEFAULT_OPTIONS: MutationObserverInit = {
    childList: true,
    subtree: true
};

/* The options as a dependency: a caller's object literal is new each render,
   and would observe again every time. Its JSON is the same while it is. */
export const keyOf = (options: MutationObserverInit) => JSON.stringify(options);

export const optionsOf = (key: string) =>
    JSON.parse(key) as MutationObserverInit;

export const composeEventHandlers = <Event extends React.SyntheticEvent>(
    external: ((event: Event) => void) | undefined,
    internal: (event: Event) => void
): ((event: Event) => void) => {
    return function (event) {
        external?.(event);

        if (!event.defaultPrevented) {
            return internal(event);
        }
    };
};

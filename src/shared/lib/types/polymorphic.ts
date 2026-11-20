/** `Omit` applied to each member of a union separately. Plain `Omit` over a
    union keeps only the keys every member shares, which turns a discriminated
    union such as controlled/uncontrolled props into one loose object. */
export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
    ? Omit<T, K>
    : never;

/**
 * Props of a component that renders as the element or component in `as`.
 *
 * - `OwnProps` win over the element's props of the same name.
 * - `Omitted` names element props the component sets itself, such as an `id`
 *   it generates, so a caller cannot pass them.
 * - `ref` needs nothing extra: in React 19 it is a prop, and
 *   `React.ComponentProps<E>` types it for the element.
 */
export type PolymorphicProps<
    E extends React.ElementType,
    OwnProps extends object = object,
    Omitted extends PropertyKey = never
> = OwnProps & { as?: E } & DistributiveOmit<
        React.ComponentProps<E>,
        keyof OwnProps | "as" | Omitted
    >;

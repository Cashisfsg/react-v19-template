type ElementProps<E extends React.ElementType = React.ElementType> = { as?: E };

export type PolymorphicProps<E extends React.ElementType> = ElementProps<E> &
    Omit<React.ComponentProps<E>, keyof ElementProps | "name">;

export const Polymorphic = <E extends React.ElementType = "p">({
    as,
    ...props
}: PolymorphicProps<E>) => {
    const Tag = as || "p";

    return <Tag {...props} />;
};

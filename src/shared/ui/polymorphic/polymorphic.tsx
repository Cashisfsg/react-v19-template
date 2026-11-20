type ElementProps<E extends React.ElementType = React.ElementType> = {
    as?: E;
};

export type PolymorphicProps<E extends React.ElementType> = ElementProps<E> &
    Omit<React.ComponentProps<E>, keyof ElementProps | "name">;

type PolymorphicFC = <E extends React.ElementType = "div">(
    props: PolymorphicProps<E>
) => React.ReactElement | null;

export const Polymorphic: PolymorphicFC = ({ as, ...props }) => {
    const Component = as || "div";

    return <Component {...props} />;
};

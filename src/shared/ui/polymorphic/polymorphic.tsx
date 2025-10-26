import React from "react";
import { Slot } from "../slot";

type ElementProps<E extends React.ElementType = React.ElementType> = {
    as?: E;
    inherit?: boolean;
};

export type PolymorphicProps<E extends React.ElementType> = ElementProps<E> &
    Omit<React.ComponentProps<E>, keyof ElementProps | "name">;

type PolymorphicFC = <E extends React.ElementType = "div">(
    props: PolymorphicProps<E>
) => React.ReactElement | null;

export const Polymorphic: PolymorphicFC = ({ as, inherit, ...props }) => {
    const Component = inherit ? Slot : as || "div";

    return <Component {...props} />;
};

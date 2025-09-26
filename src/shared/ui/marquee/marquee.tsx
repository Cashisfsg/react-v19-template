import React from "react";

import styles from "./marquee.module.css";

interface RootProps extends React.ComponentProps<"div"> {
    children: React.ReactElement<typeof List>;
}

export const Root: React.FC<RootProps> = ({
    className = "",
    children,
    ...props
}) => {
    return (
        <div
            role="marquee"
            className={`${styles.marquee} ${className}`.trim()}
            {...props}
        >
            {children}
            {React.cloneElement(children, {
                ...children.props,
                "aria-hidden": true
            })}
        </div>
    );
};

Root.displayName = "Marquee.Root";

interface ListProps extends React.ComponentProps<"ul"> {}

export const List: React.FC<ListProps> = ({ className = "", ...props }) => {
    return (
        <ul
            {...props}
            className={`${styles["marquee-list"]} ${className}`.trim()}
        />
    );
};

List.displayName = "Marquee.List";

interface ItemProps extends React.ComponentProps<"li"> {}

export const Item: React.FC<ItemProps> = props => {
    return <li {...props} />;
};

Item.displayName = "Marquee.Item";

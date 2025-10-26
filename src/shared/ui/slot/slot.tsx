import React from "react";

interface SlotProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode;
}

export const Slot: React.FC<SlotProps> = ({ children, ...props }) => {
    let child: React.ReactNode;

    try {
        child = React.Children.only(children);
    } catch {
        throw new Error(
            "[Slot]: Expected exactly one React element as a single child."
        );
    }

    if (!React.isValidElement(child)) {
        throw new Error("[Slot]: Expected a valid React element as child.");
    }

    const element = child as React.ReactElement<Record<string, any>>;

    const mergedProps = {
        ...element.props,
        ...props,
        className: [element.props.className, props.className]
            .filter(Boolean)
            .join(" "),
        style: { ...element.props.style, ...props.style }
    };

    return React.cloneElement(child, mergedProps);
};

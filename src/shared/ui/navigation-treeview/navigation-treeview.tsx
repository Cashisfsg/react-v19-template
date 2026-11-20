import React, {
    createContext,
    useContext,
    useId,
    useRef,
    useState
} from "react";
import { composeEventHandlers } from "~/shared/lib/utils/compose-event-handlers";
import { composeRefs } from "~/shared/lib/utils/compose-refs";

import { Slot } from "../slot";
import styles from "./tree.module.css";

/* -------------------- Context -------------------- */

interface TreeContextValue {
    activeId: string | null;
    visibleRefs: React.RefObject<HTMLLIElement[]>;
    setActiveId: (id: string) => void;
    expanded: Record<string, boolean>;
    toggleExpanded: (id: string) => void;
    registerItem: (ref: HTMLLIElement | null) => void;
    focusNext: (current: HTMLLIElement) => void;
    focusPrev: (current: HTMLLIElement) => void;
    focusFirst: () => void;
    focusLast: () => void;
}

const TreeContext = createContext<TreeContextValue | null>(null);

function useTreeContext() {
    const ctx = useContext(TreeContext);

    if (!ctx) throw new Error("TreeView.* must be used within <TreeView>");

    return ctx;
}

/* -------------------- Root Component -------------------- */

interface TreeViewProps extends React.ComponentProps<"ul"> {
    defaultActiveId?: string;
}

export const Root: React.FC<TreeViewProps> = ({
    defaultActiveId,
    children,
    className,
    ref,
    ...props
}) => {
    const [activeId, setActiveId] = useState<string | null>(
        defaultActiveId ?? null
    );
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const visibleRefs = useRef<HTMLLIElement[]>([]);

    const registerItem = (ref: HTMLLIElement | null) => {
        if (ref && !visibleRefs.current.includes(ref)) {
            visibleRefs.current.push(ref);
        }
    };

    const toggleExpanded = (id: string) =>
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

    const focusNext = (current: HTMLLIElement) => {
        const idx = visibleRefs.current.indexOf(current);
        if (idx < visibleRefs.current.length - 1) {
            visibleRefs.current[idx + 1]?.focus();
        }
    };

    const focusPrev = (current: HTMLLIElement) => {
        const idx = visibleRefs.current.indexOf(current);
        if (idx > 0) {
            visibleRefs.current[idx - 1]?.focus();
        }
    };

    const focusFirst = () => {
        visibleRefs.current[0]?.focus();
    };

    const focusLast = () => {
        visibleRefs.current[visibleRefs.current.length - 1]?.focus();
    };

    return (
        <TreeContext
            value={{
                activeId,
                visibleRefs,
                setActiveId,
                expanded,
                toggleExpanded,
                registerItem,
                focusNext,
                focusPrev,
                focusFirst,
                focusLast
            }}
        >
            <ul
                {...props}
                role="tree"
                className={className}
                ref={composeRefs(node => {
                    if (!node) {
                        visibleRefs.current.length = 0;
                    }

                    visibleRefs.current[0]?.setAttribute("tabindex", "0");
                }, ref)}
            >
                {children}
            </ul>
        </TreeContext>
    );
};

Root.displayName = "Tree.Root";

/* -------------------- Label -------------------- */

interface TreeLabel extends React.ComponentProps<"span"> {
    inherit?: boolean;
}

export const Label: React.FC<TreeLabel> = ({ inherit, ...props }) => {
    if (inherit) {
        return <Slot {...props} />;
    }

    return <span {...props} />;
};

Label.displayName = "Tree.Label";

/* -------------------- Item --------------------- */

interface TreeViewItemProps
    extends Omit<
        React.ComponentProps<"li">,
        "id" | "role" | "tabIndex" | "aria-expanded" | "aria-current"
    > {}

export const Item: React.FC<TreeViewItemProps> = ({
    className = "",
    onClick,
    onKeyDown,
    children,
    ref,
    ...props
}) => {
    const {
        setActiveId,
        toggleExpanded,
        registerItem,
        focusNext,
        focusPrev,
        focusFirst,
        focusLast,
        expanded
    } = useTreeContext();
    const id = `tree-group-${useId()}`;
    const isExpanded = expanded[id] ?? false;

    const childrenArray = React.Children.toArray(children);

    const hasChildren = childrenArray.some(child => {
        if (React.isValidElement(child)) {
            return (child.type as any).displayName === "Tree.Group";
        }

        return false;
    });

    // console.log("Has Children");

    // console.log(hasChildren);

    // console.log(childrenArray);

    const handleKeyDown: React.KeyboardEventHandler<HTMLLIElement> = event => {
        const target = event.currentTarget;
        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                focusNext(target);
                break;
            case "ArrowUp":
                event.preventDefault();
                focusPrev(target);
                break;
            case "ArrowRight":
                if (hasChildren && !isExpanded) {
                    event.preventDefault();
                    toggleExpanded(id);
                }
                break;
            case "ArrowLeft":
                if (hasChildren && isExpanded) {
                    event.preventDefault();
                    toggleExpanded(id);
                }
                break;
            case "Home":
                event.preventDefault();
                focusFirst();
                break;
            case "End":
                event.preventDefault();
                focusLast();
                break;
            case "Enter":
            case " ":
                event.preventDefault();
                setActiveId(id);
                break;
        }
    };

    const handleClick: React.MouseEventHandler<HTMLLIElement> = event => {
        const target = event.currentTarget;

        if (!target.hasAttribute("aria-expanded")) {
            event.stopPropagation();
            return;
        }

        const expanded = target.getAttribute("aria-expanded") === "true";
        target.setAttribute("aria-expanded", String(!expanded));
        event.stopPropagation();
    };

    const callbackRef: React.Ref<HTMLLIElement> = node => registerItem(node);

    return (
        <li
            {...props}
            role="treeitem"
            tabIndex={-1}
            aria-expanded={hasChildren ? false : undefined}
            aria-owns={hasChildren ? id : undefined}
            onClick={composeEventHandlers(onClick, handleClick)}
            onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
            className={`${styles.treeitem} ${className}`.trim()}
            ref={composeRefs(callbackRef, ref)}
        >
            {React.Children.map(children, child => {
                if (!React.isValidElement(child)) {
                    return child;
                }

                if ((child.type as any).displayName !== "Tree.Group") {
                    return child;
                }

                return React.cloneElement(
                    child as React.ReactElement<HTMLUListElement>,
                    {
                        ...(child.props as object),
                        id: id,
                        key: useId()
                    }
                );
            })}
        </li>
    );
};

Item.displayName = "Tree.Item";

/* -------------------- Group -------------------- */

interface TreeViewGroupProps
    extends Omit<React.ComponentProps<"ul">, "group"> {}

export const Group: React.FC<TreeViewGroupProps> = ({
    className,
    ...props
}) => {
    return (
        <ul
            {...props}
            role="group"
            className={`${styles.group} ${className}`.trim()}
        />
    );
};

Group.displayName = "Tree.Group";

import {
    Activity,
    useCallback,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
    useTransition
} from "react";

import { ErrorBoundary } from "~/shared/ui/error-boundary";

import { composeEventHandlers } from "~/shared/lib/utils/compose-event-handlers";
import { composeRefs } from "~/shared/lib/utils/compose-refs";

import { TabsContext, useTabsContext } from "./use-tabs-context";

import styles from "./tabs.module.css";

interface RootProps {
    children: React.ReactNode;
    defaultValue?: string | undefined;
    value?: string;
    onValueChange?: (value: string) => void;
}

export const Root: React.FC<RootProps> = ({
    children,
    defaultValue,
    value: controlledValue,
    onValueChange
}) => {
    const [uncontrolledValue, setUncontrolledValue] = useState(
        defaultValue ?? ""
    );
    const tabsRefs = useRef<HTMLButtonElement[]>([]);
    const [isPending, startTransition] = useTransition();
    // Ids are built from it, so two tab sets on one page with the same values
    // do not point their triggers at each other's panels.
    const baseId = useId();

    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : uncontrolledValue;

    const setValue = useCallback(
        (newValue: string) => {
            startTransition(() => {
                if (!isControlled) setUncontrolledValue(newValue);
                onValueChange?.(newValue);
            });
        },
        [isControlled, onValueChange]
    );

    const contextValue = useMemo(
        () => ({
            value: currentValue,
            setValue,
            tabsRefs,
            isPending,
            baseId
        }),
        [currentValue, setValue, isPending, baseId]
    );

    return <TabsContext value={contextValue}>{children}</TabsContext>;
};

Root.displayName = "Tabs.Root";

interface ListProps extends Omit<
    React.ComponentProps<"div">,
    "role" | "onKeyDownCapture"
> {}

export const List: React.FC<ListProps> = ({
    "aria-orientation": ariaOrientation = "horizontal",
    className = "",
    ...props
}) => {
    const { tabsRefs } = useTabsContext();

    const onKeyDownHandler: React.KeyboardEventHandler<
        HTMLDivElement
    > = event => {
        const tabs = tabsRefs.current;
        const currentIndex = tabs.findIndex(tab => tab === event.target);

        if (currentIndex === -1) return;

        let newIndex: number;

        switch (event.key) {
            case "ArrowRight":
                newIndex = (currentIndex + 1) % tabs.length;
                break;
            case "ArrowLeft":
                newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                break;
            case "Home":
                newIndex = 0;
                break;
            case "End":
                newIndex = tabs.length - 1;
                break;
            default:
                return;
        }

        event.preventDefault();
        event.stopPropagation();
        const newTab = tabs[newIndex];
        newTab?.focus();
        newTab?.click();
    };

    return (
        <div
            {...props}
            role="tablist"
            aria-orientation={ariaOrientation}
            className={`${styles.list} ${className}`.trim()}
            onKeyDownCapture={onKeyDownHandler}
        />
    );
};

List.displayName = "Tabs.List";

interface TriggerProps extends Omit<
    React.ComponentProps<"button">,
    "id" | "role" | "type" | "aria-selected" | "aria-controls" | "tabIndex"
> {
    value: string;
}

export const Trigger: React.FC<TriggerProps> = ({
    value,
    onClick,
    onPointerDown,
    className = "",
    ref,
    ...props
}) => {
    const { value: activeValue, setValue, tabsRefs, baseId } = useTabsContext();
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    const isActive = activeValue === value;

    const activate = useCallback(() => {
        setValue(value);
    }, [setValue, value]);

    useEffect(() => {
        const node = buttonRef.current;
        if (!node) return;
        tabsRefs.current.push(node);
        return () => {
            tabsRefs.current = tabsRefs.current.filter(entry => entry !== node);
        };
    }, [tabsRefs]);

    // A touch activates on press rather than on release, so the tab answers as
    // soon as the finger lands; the click that follows is then skipped.
    const onPointerDownHandler: React.PointerEventHandler<
        HTMLButtonElement
    > = event => {
        if (event.pointerType === "mouse" || event.button !== 0) {
            return;
        }

        event.currentTarget.dataset.touchActivated = "true";
        activate();
    };

    const onClickHandler: React.MouseEventHandler<
        HTMLButtonElement
    > = event => {
        const trigger = event.currentTarget;
        if (trigger.dataset.touchActivated === "true") {
            delete trigger.dataset.touchActivated;
        } else {
            activate();
        }
        trigger.scrollIntoView({ block: "nearest", inline: "center" });
    };

    return (
        <button
            {...props}
            id={`${baseId}-tab-${value}`}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-controls={`${baseId}-panel-${value}`}
            className={`${styles.trigger} ${className}`.trim()}
            tabIndex={isActive ? 0 : -1}
            onPointerDown={composeEventHandlers(
                onPointerDown,
                onPointerDownHandler
            )}
            onClick={composeEventHandlers(onClick, onClickHandler)}
            ref={composeRefs(buttonRef, ref)}
        />
    );
};

Trigger.displayName = "Tabs.Trigger";

interface ContentProps extends Omit<
    React.ComponentProps<"div">,
    "id" | "role" | "aria-labelledby" | "tabIndex" | "children"
> {
    value: string;
    /** A function gets whether the switch to another tab is still rendering. */
    children: React.ReactNode | ((isPending: boolean) => React.ReactNode);
}

export const Content: React.FC<ContentProps> = ({
    value,
    children,
    ...props
}) => {
    const { value: activeValue, isPending, baseId } = useTabsContext();

    const isActive = activeValue === value;

    // A panel that throws breaks only itself, and gets another try when the
    // reader comes back to it.
    return (
        <ErrorBoundary resetKeys={[isActive]}>
            <Activity mode={isActive ? "visible" : "hidden"}>
                <div
                    {...props}
                    id={`${baseId}-panel-${value}`}
                    role="tabpanel"
                    hidden={!isActive}
                    aria-labelledby={`${baseId}-tab-${value}`}
                    tabIndex={0}
                >
                    {typeof children === "function"
                        ? children(isPending)
                        : children}
                </div>
            </Activity>
        </ErrorBoundary>
    );
};

Content.displayName = "Tabs.Content";

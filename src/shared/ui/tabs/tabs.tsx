import { useRef, useState } from "react";

import { composeEventHandlers } from "~/shared/lib/utils/compose-event-handlers";
import { composeRefs } from "~/shared/lib/utils/compose-refs";

import { TabsContext, useTabsContext } from "./use-tabs-context";

interface RootProps extends React.ComponentProps<"div"> {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
}

export const Root: React.FC<RootProps> = ({
    defaultValue,
    value: controlledValue,
    onValueChange,
    ...props
}) => {
    const [uncontrolledValue, setUncontrolledValue] = useState(
        defaultValue ?? ""
    );
    const tabsRefs = useRef<HTMLButtonElement[]>([]);

    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : uncontrolledValue;

    const setValue = (newValue: string) => {
        if (!isControlled) setUncontrolledValue(newValue);
        onValueChange?.(newValue);
    };

    const registerTab = (ref: HTMLButtonElement) => {
        if (!tabsRefs.current.includes(ref)) {
            tabsRefs.current.push(ref);
        }
    };

    return (
        <TabsContext.Provider
            value={{ value: currentValue, setValue, registerTab, tabsRefs }}
        >
            <div {...props} />
        </TabsContext.Provider>
    );
};

Root.displayName = "Tabs.Root";

interface ListProps extends Omit<React.ComponentProps<"div">, "role"> {}

export const List: React.FC<ListProps> = ({
    "aria-orientation": ariaOrientation = "horizontal",
    ...props
}) => {
    return (
        <div
            {...props}
            role="tablist"
            aria-orientation={ariaOrientation}
        />
    );
};

List.displayName = "Tabs.List";

interface TriggerProps
    extends Omit<
        React.ComponentProps<"button">,
        "id" | "role" | "type" | "aria-selected" | "aria-controls" | "tabIndex"
    > {
    value: string;
}

export const Trigger: React.FC<TriggerProps> = ({
    value,
    onClick,
    onKeyDown,
    ref,
    ...props
}) => {
    const {
        value: activeValue,
        setValue,
        registerTab,
        tabsRefs
    } = useTabsContext();

    const isActive = activeValue === value;

    const onClickHandler: React.MouseEventHandler<HTMLButtonElement> = () => {
        setValue(value);
    };

    const onKeyDownHandler: React.KeyboardEventHandler<
        HTMLButtonElement
    > = event => {
        const tabs = tabsRefs.current;
        const currentIndex = tabs.findIndex(tab => tab === event.currentTarget);

        if (currentIndex === -1) return;

        let newIndex = currentIndex;

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
        const newTab = tabs[newIndex];
        newTab.focus();
        newTab.click();
    };

    const callbackRef: React.RefCallback<HTMLButtonElement> = node => {
        if (!node) return;

        registerTab(node);
    };

    return (
        <button
            {...props}
            id={`tab-${value}`}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-controls={`panel-${value}`}
            tabIndex={isActive ? 0 : -1}
            onClick={composeEventHandlers(onClick, onClickHandler)}
            onKeyDown={composeEventHandlers(onKeyDown, onKeyDownHandler)}
            ref={composeRefs(callbackRef, ref)}
        />
    );
};

Trigger.displayName = "Tabs.Trigger";

interface ContentProps
    extends Omit<
        React.ComponentProps<"div">,
        "id" | "role" | "aria-labelledby" | "tabIndex"
    > {
    value: string;
}

export const Content: React.FC<ContentProps> = ({
    value,
    children,
    ...props
}) => {
    const { value: activeValue } = useTabsContext();

    const isActive = activeValue === value;

    return (
        <div
            {...props}
            key={value}
            id={`panel-${value}`}
            role="tabpanel"
            hidden={!isActive}
            aria-labelledby={`tab-${value}`}
            tabIndex={0}
        >
            {isActive ? children : null}
        </div>
    );
};

Content.displayName = "Tabs.Content";

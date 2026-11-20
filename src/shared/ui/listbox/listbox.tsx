import React, { useId, useMemo, useRef } from "react";
import { composeEventHandlers } from "~/shared/lib/utils/compose-event-handlers";

import { composeRefs } from "~/shared/lib/utils/compose-refs";
import { ListboxContext, useListboxContext } from "./use-listbox-context";

interface RootProps
    extends Omit<React.ComponentProps<"ul">, "role" | "tabIndex"> {}

export const Root: React.FC<RootProps> = ({
    onClick,
    onKeyDown,
    children,
    ...props
}) => {
    const optionsRef = useRef<Map<string, HTMLLIElement>>(new Map());
    const optionsArrayRef = useRef<React.RefObject<HTMLLIElement>[]>([]);

    const onClickHandler: React.MouseEventHandler<HTMLUListElement> = event => {
        const listbox = event.currentTarget;
        const target = event.target;

        if (!(target instanceof HTMLElement)) return;

        const option = target.closest('[role="option"]');

        if (!option) return;

        const activedescendant = listbox.getAttribute("aria-activedescendant");

        if (activedescendant) {
            const currentOption = optionsRef.current.get(activedescendant);

            if (currentOption === option) return;

            currentOption?.setAttribute("aria-selected", "false");
        }

        const optionId = option.getAttribute("id");

        if (!optionId) return;

        option.setAttribute("aria-selected", "true");
        listbox.setAttribute("aria-activedescendant", optionId);
    };

    const onKeyDownHandler: React.KeyboardEventHandler<
        HTMLUListElement
    > = event => {
        const listbox = event.currentTarget;
        const key = event.key;

        console.log("Key pressed: ", key);

        switch (key) {
            case "ArrowDown": {
                break;
            }

            default:
                break;
        }
    };

    const context = useMemo(() => ({ optionsRef, optionsArrayRef }), []);

    return (
        <ListboxContext value={context}>
            <ul
                {...props}
                role="listbox"
                tabIndex={0}
                onClick={composeEventHandlers(onClick, onClickHandler)}
                onKeyDown={composeEventHandlers(onKeyDown, onKeyDownHandler)}
            >
                {/* {children} */}
                {React.Children.map(children, (child, index) => {
                    if (!React.isValidElement(child)) return child;

                    if (child.type !== Option) return child;

                    if (!optionsArrayRef.current[index]) {
                        optionsArrayRef.current[index] =
                            React.createRef<HTMLLIElement>();
                    }

                    return React.cloneElement(child, {
                        ...child.props,
                        name: "option-name",
                        ref: optionsArrayRef.current[index]
                    });
                })}
            </ul>

            <button
                onClick={() => {
                    console.log(optionsArrayRef.current);
                    optionsArrayRef.current[0].current.style = `color: red`;
                }}
            >
                Click
            </button>
        </ListboxContext>
    );
};

interface GroupProps extends Omit<React.ComponentProps<"ul">, "role"> {}

export const Group: React.FC<GroupProps> = ({ ...props }) => {
    return (
        <ul
            {...props}
            role="group"
        />
    );
};

Group.displayName = "Listbox.Group";

interface OptionProps
    extends Omit<React.ComponentProps<"li">, "role" | "aria-selected"> {}

export const Option: React.FC<OptionProps> = ({ ref, ...props }) => {
    const optionId = `option-${useId()}`;

    const { optionsRef, optionsArrayRef } = useListboxContext();

    return (
        <li
            {...props}
            id={optionId}
            role="option"
            aria-selected="false"
            // ref={optionsArrayRef.current[0]}
            // ref={node => {
            //     console.log(typeof node);
            //     console.log(node);
            // }}

            ref={composeRefs(node => {
                if (!node) {
                    optionsRef.current.delete(optionId);
                } else {
                    optionsRef.current.set(optionId, node);
                }
            }, ref)}
        />
    );
};

Option.displayName = "Listbox.Option";

import { createContext, use } from "react";

import type { useListNavigation } from "~/shared/lib/hooks/use-list-navigation";

/** Which end of the list a key press asked to open on. */
export type OpenFocus = "first" | "last";

export type MenuNavigation = ReturnType<typeof useListNavigation>;

interface MenuContextType {
    /** Names a menu with no title after the button that opened it. */
    triggerId: string;
    /** Names a menu in a sheet after the sheet's `Menu.Title`. */
    titleId: string;
    /** The popover panel: the `<menu>` itself, or the sheet holding it. */
    menuRef: React.RefObject<HTMLElement | null>;
    /** Whether the panel is open, as the platform last reported it. */
    isOpen: boolean;
    /** Which item the next open lands on, when the press that opens it says. */
    openFocusRef: React.RefObject<OpenFocus | null>;
    /** The active item, kept by `useListNavigation`. */
    navigation: MenuNavigation;
}

export const MenuContext = createContext<MenuContextType | null>(null);

/** Whether the parts sit in a `Menu.Sheet`, which is then the popover. */
export const MenuSheetContext = createContext(false);

/** The id a `Menu.Group` is named by, which its `Menu.GroupLabel` wears. */
export const MenuGroupContext = createContext<string | null>(null);

export const useMenuGroupLabelId = () => {
    const labelId = use(MenuGroupContext);

    if (labelId === null) {
        throw new Error(
            "Menu.GroupLabel must be rendered within the Menu.Group component"
        );
    }

    return labelId;
};

export const useMenuContext = () => {
    const context = use(MenuContext);

    if (!context) {
        throw new Error(
            "Menu compound components must be rendered within the Menu.Root component"
        );
    }

    return context;
};

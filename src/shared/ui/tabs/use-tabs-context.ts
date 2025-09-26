import { createContext, use } from "react";

export type TabsContextType = {
    value: string;
    setValue: (value: string) => void;
    tabsRefs: React.RefObject<HTMLButtonElement[]>;
};

export const TabsContext = createContext<TabsContextType | null>(null);

export const useTabsContext = () => {
    const context = use(TabsContext);

    if (!context) {
        throw new Error(
            "Tabs compound components must be used within <Tabs />"
        );
    }

    return context;
};

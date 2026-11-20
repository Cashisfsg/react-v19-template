import { useState } from "react";

import * as Menu from "./menu";

import styles from "./menu.example.module.css";

type Sort = "new" | "old" | "popular";

const SORTS: readonly { value: Sort; label: string }[] = [
    { value: "new", label: "Newest first" },
    { value: "old", label: "Oldest first" },
    { value: "popular", label: "Most popular" }
];

/**
 * A menu of actions and a sheet of choices, and the checks a unit test cannot
 * make:
 *
 * - Focus stays on the `<menu>` while the arrows move: the active item is
 *   ringed through `data-active`, and the menu's `aria-activedescendant`
 *   names it. A screen reader reads "Rename, menu item" on every move.
 * - Down on the closed trigger opens on the first item, Up on the last; Up
 *   and Down wrap, Home and End jump, a letter finds the next item with it.
 * - Enter and Space press the active item and close the menu; Escape and Tab
 *   close it, and focus goes back to the trigger.
 * - "Archive" refuses through `aria-disabled`: the arrows stop on it, Enter
 *   does nothing. "Delete" is natively disabled and the arrows skip it.
 * - The sort sheet opens on the choice in force, and a pick moves the check.
 *   On a narrow screen it is a bottom sheet, on a wide one a panel.
 * - A click on an item does not take the focus off the menu.
 *
 * Not exported from the barrel: mount it by importing this file directly.
 */
export const MenuExample: React.FC = () => {
    const [log, setLog] = useState("Nothing picked yet");
    const [sort, setSort] = useState<Sort>("new");

    const handleRename = () => {
        setLog("Rename");
    };

    const handleDuplicate = () => {
        setLog("Duplicate");
    };

    const handleArchive = () => {
        setLog("Archive should never fire");
    };

    const handleSortChange = (event: React.MouseEvent<HTMLButtonElement>) => {
        const { value } = event.currentTarget.dataset;
        const picked = SORTS.find(item => item.value === value);
        if (picked !== undefined) setSort(picked.value);
    };

    return (
        <section className={styles.example}>
            <h3 className={styles.title}>Menu example</h3>

            <div className={styles.row}>
                <Menu.Root>
                    <Menu.Trigger className={styles.trigger}>
                        Actions
                    </Menu.Trigger>
                    <Menu.List>
                        <Menu.Item onClick={handleRename}>Rename</Menu.Item>
                        <Menu.Item onClick={handleDuplicate}>
                            Duplicate
                        </Menu.Item>
                        <Menu.Separator />
                        <Menu.Item
                            aria-disabled="true"
                            onClick={handleArchive}
                        >
                            Archive
                        </Menu.Item>
                        <Menu.Item disabled>Delete</Menu.Item>
                    </Menu.List>
                </Menu.Root>

                <Menu.Root>
                    <Menu.Trigger className={styles.trigger}>Sort</Menu.Trigger>
                    <Menu.Sheet>
                        <Menu.Handle />
                        <header>
                            <Menu.Title as="h4">Sort by</Menu.Title>
                            <Menu.Close aria-label="Close">✕</Menu.Close>
                        </header>
                        <Menu.List>
                            <Menu.Group aria-label="Order">
                                {SORTS.map(item => (
                                    <Menu.RadioItem
                                        key={item.value}
                                        data-value={item.value}
                                        checked={item.value === sort}
                                        onClick={handleSortChange}
                                    >
                                        {item.label}
                                        {item.value === sort && (
                                            <span aria-hidden="true">✓</span>
                                        )}
                                    </Menu.RadioItem>
                                ))}
                            </Menu.Group>
                        </Menu.List>
                    </Menu.Sheet>
                </Menu.Root>
            </div>

            <output>{log}</output>
        </section>
    );
};

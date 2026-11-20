import { useState } from "react";

import * as NavigationTreeview from "./navigation-treeview";

import styles from "./navigation-treeview.example.module.css";

/**
 * A site's navigation three levels deep, and the checks a unit test cannot
 * make:
 *
 * - Tab into the tree: the focus lands on "Team", the current page, and its
 *   ancestors "About" and "People" are open.
 * - Down and Up walk the shown links and pass over closed sections; Home and
 *   End jump to the first and the last shown link.
 * - On "Products", Right opens it and Right again steps onto "Software";
 *   Left steps back to "Products" and Left again closes it.
 * - On "Team", type "c": the focus moves to "Careers", then to "Contact"
 *   on the next "c", passing over closed sections.
 * - Enter or Space follows the link: the current page below changes, and
 *   Tab out and back lands on the new one.
 * - A click on the chevron opens and closes without following the link.
 * - A screen reader reads "About, expanded" with its level and position,
 *   and "Team, current page".
 *
 * Not exported from the barrel: mount it by importing this file directly.
 */
export const NavigationTreeviewExample: React.FC = () => {
    const [current, setCurrent] = useState("#team");

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        setCurrent(event.currentTarget.getAttribute("href") ?? "");
    };

    const itemProps = (href: string) => ({
        href,
        current: href === current,
        onClick: handleClick
    });

    return (
        <section className={styles.example}>
            <h3 className={styles.title}>NavigationTreeview example</h3>

            <NavigationTreeview.Root aria-label="Site">
                <NavigationTreeview.Item
                    label="Home"
                    {...itemProps("#home")}
                />
                <NavigationTreeview.Item
                    label="About"
                    {...itemProps("#about")}
                >
                    <NavigationTreeview.Item
                        label="History"
                        {...itemProps("#history")}
                    />
                    <NavigationTreeview.Item
                        label="People"
                        {...itemProps("#people")}
                    >
                        <NavigationTreeview.Item
                            label="Team"
                            {...itemProps("#team")}
                        />
                        <NavigationTreeview.Item
                            label="Careers"
                            {...itemProps("#careers")}
                        />
                    </NavigationTreeview.Item>
                </NavigationTreeview.Item>
                <NavigationTreeview.Item
                    label="Products"
                    {...itemProps("#products")}
                >
                    <NavigationTreeview.Item
                        label="Software"
                        {...itemProps("#software")}
                    />
                    <NavigationTreeview.Item
                        label="Hardware"
                        {...itemProps("#hardware")}
                    />
                </NavigationTreeview.Item>
                <NavigationTreeview.Item
                    label="Contact"
                    {...itemProps("#contact")}
                />
            </NavigationTreeview.Root>

            <output>Current page: {current}</output>
        </section>
    );
};

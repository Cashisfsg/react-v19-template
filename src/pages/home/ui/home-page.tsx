import { useId } from "react";

import { AccordionExample } from "~/shared/ui/accordion/accordion.example";
import { AnchorExample } from "~/shared/ui/anchor/anchor.example";
import { ActionButtonExample } from "~/shared/ui/button/action-button.example";
import { ButtonExample } from "~/shared/ui/button/button.example";
import { CountDownTimer } from "~/shared/ui/countdown-timer";
import { DialogExample } from "~/shared/ui/dialog/dialog.example";
import { DropZoneExample } from "~/shared/ui/drop-zone/drop-zone.example";
import { ErrorBoundaryExample } from "~/shared/ui/error-boundary/error-boundary.example";
import { Input } from "~/shared/ui/input";
import { LinkExample } from "~/shared/ui/link/link.example";
import { SortableListExample } from "~/shared/ui/list/sortable-list/sortable-list.example";
import { Marquee } from "~/shared/ui/marquee";
import { MarqueeExample } from "~/shared/ui/marquee/marquee.example";
import { MenuExample } from "~/shared/ui/menu/menu.example";
import { PopoverExample } from "~/shared/ui/popover/popover.example";
import { PortalExample } from "~/shared/ui/portal/portal.example";
import { ProgressExample } from "~/shared/ui/progress/progress.example";
import { Section } from "~/shared/ui/section";
import { SectionExample } from "~/shared/ui/section/section.example";
import { SwitchExample } from "~/shared/ui/switch/switch.example";
import { TabsExample } from "~/shared/ui/tabs/tabs.example";
import { TooltipExample } from "~/shared/ui/tooltip/tooltip.example";

import styles from "./home-page.module.css";

const InputCard: React.FC = () => {
    const id = useId();

    return (
        <section className={styles["own-card"]}>
            <h3>Input example</h3>
            <label htmlFor={id}>Email</label>
            <Input
                id={id}
                type="email"
                placeholder="name@example.com"
                required
            />
        </section>
    );
};

const TimerCard: React.FC = () => (
    <section className={styles["own-card"]}>
        <h3>Countdown timer</h3>
        <CountDownTimer />
    </section>
);

interface Example {
    /* A key of its own: a function's name does not survive minification. */
    key: string;
    Component: React.FC;
}

interface Group {
    id: string;
    title: string;
    description: string;
    examples: readonly Example[];
}

const GROUPS: readonly Group[] = [
    {
        id: "actions",
        title: "Actions",
        description: "Buttons, a menu of commands and the hint beside them.",
        examples: [
            { key: "button", Component: ButtonExample },
            { key: "action-button", Component: ActionButtonExample },
            { key: "menu", Component: MenuExample },
            { key: "tooltip", Component: TooltipExample }
        ]
    },
    {
        id: "overlays",
        title: "Overlays",
        description:
            "Panels in the top layer: dialogs, popovers, anchoring and portals.",
        examples: [
            { key: "dialog", Component: DialogExample },
            { key: "popover", Component: PopoverExample },
            { key: "anchor", Component: AnchorExample },
            { key: "portal", Component: PortalExample }
        ]
    },
    {
        id: "content",
        title: "Content",
        description: "Ways to arrange, reveal and name what is on the page.",
        examples: [
            { key: "tabs", Component: TabsExample },
            { key: "accordion", Component: AccordionExample },
            { key: "section", Component: SectionExample },
            { key: "marquee", Component: MarqueeExample },
            { key: "link", Component: LinkExample }
        ]
    },
    {
        id: "forms",
        title: "Forms",
        description:
            "Controls a person types into, toggles, drops onto or sorts.",
        examples: [
            { key: "switch", Component: SwitchExample },
            { key: "input", Component: InputCard },
            { key: "drop-zone", Component: DropZoneExample },
            { key: "sortable-list", Component: SortableListExample }
        ]
    },
    {
        id: "feedback",
        title: "Feedback",
        description: "What the page says while it works, waits or breaks.",
        examples: [
            { key: "progress", Component: ProgressExample },
            { key: "timer", Component: TimerCard },
            { key: "error-boundary", Component: ErrorBoundaryExample }
        ]
    }
];

export function HomePage() {
    return (
        <>
            <Marquee.Root
                aria-label="What is inside"
                className={styles.announcement}
            >
                <Marquee.List>
                    <Marquee.Item>React 19 with React Router SSR</Marquee.Item>
                    <Marquee.Item>
                        Popover API and anchor positioning
                    </Marquee.Item>
                    <Marquee.Item>A menu on aria-activedescendant</Marquee.Item>
                    <Marquee.Item>CSS Modules in cascade layers</Marquee.Item>
                    <Marquee.Item>No runtime UI dependencies</Marquee.Item>
                </Marquee.List>
            </Marquee.Root>

            <header className={styles.header}>
                <h1>React v19 template</h1>
                <p className={styles.lead}>
                    Every shared component, live. Each example lists the checks
                    only a person can make in its doc comment.
                </p>

                <nav
                    aria-label="Component groups"
                    className={styles.navigation}
                >
                    <ul>
                        {GROUPS.map(group => (
                            <li key={group.id}>
                                <a href={`#${group.id}`}>{group.title}</a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </header>

            <main className={styles.main}>
                {GROUPS.map(group => (
                    <Section.Root
                        key={group.id}
                        id={group.id}
                        className={styles.group}
                    >
                        <Section.Label className={styles["group-title"]}>
                            {group.title}
                        </Section.Label>
                        <Section.Description className={styles.description}>
                            {group.description}
                        </Section.Description>

                        <ul className={styles.cards}>
                            {group.examples.map(({ key, Component }) => (
                                <li
                                    key={key}
                                    className={styles.card}
                                >
                                    <Component />
                                </li>
                            ))}
                        </ul>
                    </Section.Root>
                ))}
            </main>
        </>
    );
}

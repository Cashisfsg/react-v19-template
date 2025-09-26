import { useState } from "react";

import "~/app/styles/index.css";

import { CountDownTimer } from "~/shared/ui/countdown-timer/countdown-timer";
import { Section } from "~/shared/ui/section";
import { Switch } from "~/shared/ui/switch";

import "./App.css";
import { default as reactLogo, default as viteLogo } from "./assets/react.svg";
import { Dialog } from "./shared/ui/dialog";
import { Marquee } from "./shared/ui/marquee";
import { Popover } from "./shared/ui/popover";
import { Tabs } from "./shared/ui/tabs";

function App() {
    const [count, setCount] = useState(0);

    return (
        <>
            <Marquee.Root>
                <Marquee.List>
                    <Marquee.Item>Lorem ipsum dolor sit amet.</Marquee.Item>
                    <Marquee.Item>Lorem ipsum dolor sit amet.</Marquee.Item>
                    <Marquee.Item>Lorem ipsum dolor sit amet.</Marquee.Item>
                    <Marquee.Item>Lorem ipsum dolor sit amet.</Marquee.Item>
                    <Marquee.Item>Lorem ipsum dolor sit amet.</Marquee.Item>
                    <Marquee.Item>Lorem ipsum dolor sit amet.</Marquee.Item>
                </Marquee.List>
            </Marquee.Root>

            <nav className="navigation">
                <ul>
                    <li>
                        <a href="#">
                            <svg
                                stroke="currentColor"
                                fill="currentColor"
                                strokeWidth="0"
                                viewBox="0 0 576 512"
                                height="1rem"
                                width="1rem"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M280.37 148.26L96 300.11V464a16 16 0 0 0 16 16l112.06-.29a16 16 0 0 0 15.92-16V368a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v95.64a16 16 0 0 0 16 16.05L464 480a16 16 0 0 0 16-16V300L295.67 148.26a12.19 12.19 0 0 0-15.3 0zM571.6 251.47L488 182.56V44.05a12 12 0 0 0-12-12h-56a12 12 0 0 0-12 12v72.61L318.47 43a48 48 0 0 0-61 0L4.34 251.47a12 12 0 0 0-1.6 16.9l25.5 31A12 12 0 0 0 45.15 301l235.22-193.74a12.19 12.19 0 0 1 15.3 0L530.9 301a12 12 0 0 0 16.9-1.6l25.5-31a12 12 0 0 0-1.7-16.93z"></path>
                            </svg>
                            <span>Link #1</span>
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            aria-current="page"
                        >
                            <svg
                                stroke="currentColor"
                                fill="currentColor"
                                strokeWidth="0"
                                viewBox="0 0 576 512"
                                height="1rem"
                                width="1rem"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M280.37 148.26L96 300.11V464a16 16 0 0 0 16 16l112.06-.29a16 16 0 0 0 15.92-16V368a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v95.64a16 16 0 0 0 16 16.05L464 480a16 16 0 0 0 16-16V300L295.67 148.26a12.19 12.19 0 0 0-15.3 0zM571.6 251.47L488 182.56V44.05a12 12 0 0 0-12-12h-56a12 12 0 0 0-12 12v72.61L318.47 43a48 48 0 0 0-61 0L4.34 251.47a12 12 0 0 0-1.6 16.9l25.5 31A12 12 0 0 0 45.15 301l235.22-193.74a12.19 12.19 0 0 1 15.3 0L530.9 301a12 12 0 0 0 16.9-1.6l25.5-31a12 12 0 0 0-1.7-16.93z"></path>
                            </svg>
                            <span>Link #2</span>
                        </a>
                    </li>
                    <li>
                        <a href="#">
                            <svg
                                stroke="currentColor"
                                fill="currentColor"
                                strokeWidth="0"
                                viewBox="0 0 576 512"
                                height="1rem"
                                width="1rem"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M280.37 148.26L96 300.11V464a16 16 0 0 0 16 16l112.06-.29a16 16 0 0 0 15.92-16V368a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v95.64a16 16 0 0 0 16 16.05L464 480a16 16 0 0 0 16-16V300L295.67 148.26a12.19 12.19 0 0 0-15.3 0zM571.6 251.47L488 182.56V44.05a12 12 0 0 0-12-12h-56a12 12 0 0 0-12 12v72.61L318.47 43a48 48 0 0 0-61 0L4.34 251.47a12 12 0 0 0-1.6 16.9l25.5 31A12 12 0 0 0 45.15 301l235.22-193.74a12.19 12.19 0 0 1 15.3 0L530.9 301a12 12 0 0 0 16.9-1.6l25.5-31a12 12 0 0 0-1.7-16.93z"></path>
                            </svg>
                            <span>Link #3</span>
                        </a>
                    </li>
                </ul>
            </nav>
            <div>
                <a
                    href="https://vite.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <img
                        src={viteLogo}
                        className="logo"
                        alt="Vite logo"
                    />
                </a>
                <a
                    href="https://react.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <img
                        src={reactLogo}
                        className="logo react"
                        alt="React logo"
                    />
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <button
                    onClick={() => {
                        setCount(count => count + 1);
                    }}
                >
                    count is {count}
                </button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
                <Switch>Switch</Switch>
            </div>

            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
            <Dialog.Root>
                <Dialog.Trigger>Dialog trigger</Dialog.Trigger>
                <Dialog.Content>Dialog content</Dialog.Content>
            </Dialog.Root>

            <Section.Root>
                <Section.Label>Label #1</Section.Label>
                <Section.Label>Label #2</Section.Label>
                <Section.Label>Label #3</Section.Label>

                {/* <Section.Label>Label #1</Section.Label> */}
            </Section.Root>

            <Popover.Root>
                <Popover.Trigger>popover trigger</Popover.Trigger>
                <Popover.Content style={{ margin: "0", inset: "auto" }}>
                    Popover content
                    <Popover.Close>Close popover</Popover.Close>
                </Popover.Content>
            </Popover.Root>

            <Tabs.Root>
                <Tabs.List>
                    <Tabs.Trigger value="1">Tab 1</Tabs.Trigger>
                    <Tabs.Trigger value="2">Tab 2</Tabs.Trigger>
                    <Tabs.Trigger value="3">Tab 3</Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="1">Content 1</Tabs.Content>
                <Tabs.Content value="2">Content 2</Tabs.Content>
                <Tabs.Content value="3">Content 3</Tabs.Content>
            </Tabs.Root>

            <CountDownTimer />
        </>
    );
}

export default App;

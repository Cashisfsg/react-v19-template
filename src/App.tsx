import { Suspense, useState } from "react";

import "~/app/styles/index.css";

import { CountDownTimer } from "~/shared/ui/countdown-timer/countdown-timer";
import { Section } from "~/shared/ui/section";
import { Switch } from "~/shared/ui/switch";

import "./App.css";
import { default as reactLogo, default as viteLogo } from "./assets/react.svg";
import { Tabs } from "./shared/ui/tabs";
import { Users } from "./Users";

function App() {
    const [count, setCount] = useState(0);

    return (
        <>
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

            <Section.Root>
                <Section.Label>Label #1</Section.Label>
                <Section.Label>Label #2</Section.Label>
                <Section.Label>Label #3</Section.Label>

                {/* <Section.Label>Label #1</Section.Label> */}
            </Section.Root>

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

            <Suspense fallback={<h1>Loading...</h1>}>
                <Users
                    promise={fetch(
                        "https://jsonplaceholder.typicode.com/users"
                    ).then(res => res.json())}
                />
            </Suspense>
        </>
    );
}

export default App;

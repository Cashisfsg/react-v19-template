import { useState } from "react";

import { SortableList } from "./sortable-list";

import styles from "./sortable-list.example.module.css";

interface Task {
    id: string;
    title: string;
}

const TASKS: readonly Task[] = [
    { id: "design", title: "Design" },
    { id: "build", title: "Build" },
    { id: "test", title: "Test" },
    { id: "ship", title: "Ship" }
];

const getKey = (task: Task) => task.id;
const getLabel = (task: Task) => task.title;
const renderTask = (task: Task) => task.title;

/**
 * A list of four tasks, and the checks a unit test cannot make:
 *
 * - Drag a row by its six dots: the row goes faint, and a line shows where
 *   it will land, above or below the row under the pointer. Drop it and the
 *   order below the list changes.
 * - Press Escape during a drag, or drop outside the list: nothing moves,
 *   the row is no longer faint and the line is gone.
 * - Tab to "Move Build up" and press it: the row moves and the focus stays
 *   on that button. A screen reader says "Build moved to the top".
 * - At the top, "up" is announced as unavailable and does nothing, but
 *   keeps the focus.
 * - Drag a file or a link over the list: no line appears.
 *
 * Not exported from the barrel: mount it by importing this file directly.
 */
export const SortableListExample: React.FC = () => {
    const [tasks, setTasks] = useState<readonly Task[]>(TASKS);

    return (
        <section className={styles.example}>
            <h3 className={styles.title}>SortableList example</h3>

            <SortableList
                aria-label="Release steps"
                items={tasks}
                getKey={getKey}
                getLabel={getLabel}
                renderItem={renderTask}
                onReorder={setTasks}
            />

            <output>{tasks.map(getLabel).join(" → ")}</output>
        </section>
    );
};

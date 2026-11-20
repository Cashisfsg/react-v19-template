import { useState } from "react";

import { DropZone } from "./drop-zone";

import styles from "./drop-zone.example.module.css";

/**
 * A zone for images and a disabled one, and the checks a unit test cannot
 * make:
 *
 * - Drag image files over the zone: it lights up and stays lit while the
 *   pointer crosses its text, and goes dark when the pointer leaves.
 * - Drop them: their names and sizes are listed. Drop a PDF along with
 *   them: it is listed as turned away.
 * - Drag selected text or a link over it: nothing lights up.
 * - Drop a file beside the zone: the browser does not open it.
 * - Tab to the zone: a ring is drawn, and Space or Enter opens the picker.
 *   A screen reader names it by its text. Picking the same file twice
 *   lists it twice.
 * - The disabled zone takes no drop and opens no picker.
 *
 * Not exported from the barrel: mount it by importing this file directly.
 */
export const DropZoneExample: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [rejected, setRejected] = useState<File[]>([]);

    const handleFiles = (taken: File[]) => {
        setFiles(current => [...current, ...taken]);
    };

    return (
        <section className={styles.example}>
            <h3 className={styles.title}>DropZone example</h3>

            <DropZone
                accept="image/*"
                multiple
                onFiles={handleFiles}
                onReject={setRejected}
            >
                Drop images here, or choose them
            </DropZone>

            {files.length > 0 && (
                <ul className={styles.files}>
                    {files.map((file, index) => (
                        <li key={`${file.name}-${index}`}>
                            {file.name}, {Math.ceil(file.size / 1024)} KB
                        </li>
                    ))}
                </ul>
            )}
            {rejected.length > 0 && (
                <p role="alert">
                    Not an image: {rejected.map(file => file.name).join(", ")}
                </p>
            )}

            <DropZone
                disabled
                onFiles={handleFiles}
            >
                Uploads are closed
            </DropZone>
        </section>
    );
};

import { useEffect, useRef } from "react";

export const CountDownTimer = () => {
    const timerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const startTime = new Date().getTime();

        const interval = setInterval(() => {
            (() => {
                const currentTime = new Date().getTime();
                const elapsedTime = Math.floor(
                    (currentTime - startTime) / 1000
                );
                const newNumber = 15 - elapsedTime;

                if (newNumber >= 0) {
                    // timerRef.current.textContent = newNumber;
                }

                if (newNumber === 10) {
                    timerRef.current?.setAttribute("role", "alert");
                    setTimeout(() => {
                        timerRef.current?.setAttribute("role", "timer");
                    }, 1000);
                }
            })();
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <div
            role="timer"
            aria-atomic="true"
            ref={timerRef}
        >
            Countdown timer
        </div>
    );
};

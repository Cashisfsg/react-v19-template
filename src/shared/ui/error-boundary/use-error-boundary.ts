import { createContext, use } from "react";

export interface ErrorBoundaryContextValue {
    /** Shows the nearest boundary's fallback for an error React never saw,
        such as one from an event handler or a promise. */
    showBoundary: (error: unknown) => void;
    resetBoundary: () => void;
}

export const ErrorBoundaryContext =
    createContext<ErrorBoundaryContextValue | null>(null);

export const useErrorBoundary = (): ErrorBoundaryContextValue => {
    const context = use(ErrorBoundaryContext);

    if (!context) {
        throw new Error(
            "useErrorBoundary must be used within an ErrorBoundary"
        );
    }

    return context;
};

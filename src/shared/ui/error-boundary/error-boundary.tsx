import { Component } from "react";

import { ErrorBoundaryFallback } from "./error-boundary-fallback";
import { ErrorBoundaryContext } from "./use-error-boundary";

import type { ErrorBoundaryContextValue } from "./use-error-boundary";

const hasResetKeysChanged = (
    prev: readonly unknown[],
    next: readonly unknown[]
): boolean => {
    if (prev.length !== next.length) return true;
    return prev.some((key, index) => !Object.is(key, next[index]));
};

export interface FallbackProps {
    error: Error;
    errorInfo: React.ErrorInfo;
    resetErrorBoundary: () => void;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode | ((props: FallbackProps) => React.ReactNode);
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    onReset?: () => void;
    /** When any of these changes while the fallback shows, the children get
        another try: a new route, a new tab, a new query. */
    resetKeys?: readonly unknown[];
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
    prevResetKeys: readonly unknown[];
    resetKeysTriggered: boolean;
}

export class ErrorBoundary extends Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            prevResetKeys: props.resetKeys ?? [],
            resetKeysTriggered: false
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error, errorInfo: null };
    }

    static getDerivedStateFromProps(
        props: ErrorBoundaryProps,
        state: ErrorBoundaryState
    ): Partial<ErrorBoundaryState> | null {
        const nextResetKeys = props.resetKeys ?? [];
        const keysChanged = hasResetKeysChanged(
            state.prevResetKeys,
            nextResetKeys
        );

        if (keysChanged && state.hasError) {
            return {
                prevResetKeys: nextResetKeys,
                resetKeysTriggered: true
            };
        }
        if (keysChanged) {
            return { prevResetKeys: nextResetKeys };
        }
        return null;
    }

    override componentDidUpdate() {
        if (this.state.resetKeysTriggered) {
            this.runOnReset();
            this.setState({
                hasError: false,
                error: null,
                errorInfo: null,
                resetKeysTriggered: false
            });
        }
    }

    override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({ errorInfo });
        this.notifyOnError(error, errorInfo);
    }

    resetErrorBoundary = () => {
        this.runOnReset();
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    showBoundary = (error: unknown) => {
        const normalizedError =
            error instanceof Error ? error : new Error(String(error));
        const errorInfo: React.ErrorInfo = { componentStack: "" };

        this.setState({ hasError: true, error: normalizedError, errorInfo });
        this.notifyOnError(normalizedError, errorInfo);
    };

    // A throwing callback must not take the boundary down with it.
    runOnReset = () => {
        try {
            this.props.onReset?.();
        } catch (error: unknown) {
            console.error("[ErrorBoundary] onReset failed:", error);
        }
    };

    notifyOnError = (error: Error, errorInfo: React.ErrorInfo) => {
        try {
            this.props.onError?.(error, errorInfo);
        } catch (callbackError: unknown) {
            console.error("[ErrorBoundary] onError failed:", callbackError);
        }
    };

    override render() {
        const contextValue: ErrorBoundaryContextValue = {
            showBoundary: this.showBoundary,
            resetBoundary: this.resetErrorBoundary
        };

        let content: React.ReactNode;

        if (this.state.hasError && this.state.error) {
            if (typeof this.props.fallback === "function") {
                content = this.props.fallback({
                    error: this.state.error,
                    errorInfo: this.state.errorInfo ?? { componentStack: "" },
                    resetErrorBoundary: this.resetErrorBoundary
                });
            } else if (this.props.fallback) {
                content = this.props.fallback;
            } else {
                content = (
                    <ErrorBoundaryFallback
                        error={this.state.error}
                        onReset={this.resetErrorBoundary}
                    />
                );
            }
        } else {
            content = this.props.children;
        }

        return (
            <ErrorBoundaryContext value={contextValue}>
                {content}
            </ErrorBoundaryContext>
        );
    }
}

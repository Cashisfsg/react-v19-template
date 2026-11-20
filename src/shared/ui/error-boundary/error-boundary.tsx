import { Component } from "react";

import styles from "./error-boundary.module.css";

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?:
        | React.ReactNode
        | ((error: Error, errorInfo: React.ErrorInfo) => React.ReactNode);
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface SuccessState {
    hasError: false;
    error: null;
    errorInfo: React.ErrorInfo;
}

interface ErrorState {
    hasError: true;
    error: Error;
    errorInfo: React.ErrorInfo;
}

type ErrorBoundaryState = SuccessState | ErrorState;

export class ErrorBoundary extends Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: { componentStack: null }
        };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            error,
            errorInfo: { componentStack: null }
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({ errorInfo });
        this.props.onError?.(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (typeof this.props.fallback === "function") {
                return this.props.fallback(
                    this.state.error,
                    this.state.errorInfo
                );
            }

            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div
                    role="alert"
                    className={styles.fallback}
                >
                    <h2 className={styles.title}>Something went wrong</h2>
                    <p className={styles.message}>{this.state.error.message}</p>
                </div>
            );
        }

        return this.props.children;
    }
}

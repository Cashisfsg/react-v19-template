import { Component } from "react";

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
            errorInfo: { componentStack: null, digest: null }
        };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            error,
            errorInfo: { componentStack: null, digest: null }
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
                    className="flex min-h-[200px] flex-col items-center justify-center p-4 text-center"
                >
                    <h2 className="text-destructive mb-2 text-lg font-semibold">
                        Something went wrong
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        {this.state.error.message}
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}

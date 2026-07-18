'use client';

import {Component, createRef, type ReactNode} from 'react';
import {AlertTriangle, RefreshCw} from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    message: string;
    resetKey: number;
}

export default class ErrorBoundary extends Component<Props, State> {
    private readonly fallbackHeadingRef = createRef<HTMLHeadingElement>();

    constructor(props: Props) {
        super(props);
        this.state = {hasError: false, message: '', resetKey: 0};
    }

    static getDerivedStateFromError(error: unknown): Partial<State> {
        const message = error instanceof Error ? error.message : String(error);
        return {hasError: true, message};
    }

    handleReload = () => {
        window.location.reload();
    };

    handleReset = () => {
        this.setState(s => ({hasError: false, message: '', resetKey: s.resetKey + 1}));
    };

    componentDidMount() {
        if (this.state.hasError) this.fallbackHeadingRef.current?.focus();
    }

    componentDidUpdate(_: Props, previousState: State) {
        if (!previousState.hasError && this.state.hasError) {
            this.fallbackHeadingRef.current?.focus();
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <main className="min-h-dvh bg-background flex items-center justify-center p-4 sm:p-6">
                    <div role="alert" className="bg-card border border-destructive/20 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center">
                        <div
                            className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-destructive"/>
                        </div>
                        <h1 ref={this.fallbackHeadingRef} tabIndex={-1} className="text-foreground text-xl font-semibold mb-2">Something went wrong</h1>
                        {this.state.message && (
                            <p className="text-muted-foreground text-sm font-mono bg-background rounded-lg px-3 py-2 mb-4 break-all">
                                {this.state.message}
                            </p>
                        )}
                        <p className="text-muted-foreground text-sm mb-6">
                            An unexpected error occurred. You can try navigating back or reload the page.
                        </p>
                        <div className="flex flex-col gap-3 justify-center sm:flex-row">
                            <button
                                type="button"
                                onClick={this.handleReset}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            >
                                Try again
                            </button>
                            <button
                                type="button"
                                onClick={this.handleReload}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            >
                                <RefreshCw className="w-4 h-4"/>
                                Reload
                            </button>
                        </div>
                    </div>
                </main>
            );
        }

        return <div key={this.state.resetKey}>{this.props.children}</div>;
    }
}




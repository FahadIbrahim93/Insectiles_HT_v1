import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center w-full h-full bg-black text-white p-8 text-center">
            <div>
                <h1 className="text-2xl font-bold text-red-500 mb-4">SYSTEM CRASH</h1>
                <p className="mb-8 opacity-50">The trip was too intense. Please restart the application.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-white text-black font-bold rounded-full"
                >
                    REBOOT
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-[200px] flex items-center justify-center backdrop-blur-sm bg-gradient-to-br from-neutral-900 to-black rounded-xl p-6 border border-neutral-800/50">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-red-400 mb-2">
              Something went wrong
            </h3>
            <p className="text-gray-400">
              The component failed to load. Please try refreshing the page.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
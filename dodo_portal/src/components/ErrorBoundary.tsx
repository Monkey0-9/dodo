import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  label?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * ErrorBoundary wraps individual portal panels to prevent a single rendering
 * error from crashing the entire dashboard. Use around Topology canvas,
 * Recharts graphs, or any data-dependent panel.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[ErrorBoundary: ${this.props.label || 'panel'}]`, error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center border border-error/30">
            <span className="material-symbols-outlined text-error text-2xl">error</span>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-on-surface text-sm uppercase tracking-widest font-mono">
              {this.props.label || 'Panel'} — Render Error
            </h3>
            <p className="text-xs text-on-surface-variant font-mono max-w-xs">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest border border-primary/40 text-primary hover:bg-primary hover:text-on-primary rounded transition-all"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

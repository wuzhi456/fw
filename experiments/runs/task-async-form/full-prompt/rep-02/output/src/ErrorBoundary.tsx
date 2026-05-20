import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };

type State = { hasError: boolean };

/**
 * Isolates render failures in the form subtree (checklist: ux-error-boundary-granularity).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="boundary-fallback" role="alert">
          <h1 className="boundary-fallback__title">Something went wrong</h1>
          <p className="boundary-fallback__text">
            The form UI crashed. You can reload the page or try again below.
          </p>
          <button
            type="button"
            className="boundary-fallback__retry"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

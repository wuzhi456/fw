import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };

type State = { hasError: boolean; error: Error | null };

/**
 * Isolates form subtree: checklist ux-error-boundary-granularity (single boundary around form).
 */
export class FormErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Form subtree error', error, info.componentStack);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      return (
        <section className="panel error-panel" role="alert">
          <h2>Something went wrong in the form</h2>
          <p className="muted">The form crashed. You can reload this section.</p>
          <button type="button" className="btn secondary" onClick={this.handleReset}>
            Reset form area
          </button>
        </section>
      );
    }
    return this.props.children;
  }
}

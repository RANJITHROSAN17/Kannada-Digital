import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

/**
 * Last line of defence: a runtime error in one page must not blank the whole
 * app during a demo. Recovery is one click and needs no reload.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // Left in the console on purpose: nothing is sent anywhere.
    console.error('Kannada Saathi crashed in a component tree:', error, info.componentStack);
  }

  private reset = () => this.setState({ error: null });

  override render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="mx-auto flex max-w-lg flex-col items-start gap-3 px-4 py-16">
        <h1 className="text-xl font-bold text-ink-800">Something broke on this screen</h1>
        <p className="text-sm text-ink-400">
          Your saved phrases and progress are still on this device. Reload the view, and if it keeps happening
          the message below is what to report.
        </p>
        <pre className="max-h-40 w-full overflow-auto whitespace-pre-wrap rounded-xl border border-rose-200 bg-rose-50 p-3 text-[11px] text-rose-800">
          {error.message}
        </pre>
        <div className="flex gap-2">
          <button type="button" className="btn-primary" onClick={this.reset}>
            Try again
          </button>
          <button type="button" className="btn-ghost" onClick={() => window.location.reload()}>
            Reload app
          </button>
        </div>
      </div>
    );
  }
}

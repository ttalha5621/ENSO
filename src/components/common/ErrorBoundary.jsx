import { Component } from 'react';
import { TriangleAlert } from 'lucide-react';

/** Keeps one failing page (or the AI layer) from taking down the map and the rest of the app. */
export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error('[ui] boundary caught', error, info);
  }
  render() {
    if (!this.state.error) return this.props.children;
    if (this.props.fallback === null) return null;
    return (
      <div className="grid h-full place-items-center p-6">
        <div className="glass max-w-md rounded-3xl p-6 text-center">
          <TriangleAlert className="mx-auto h-8 w-8 text-amber-400" />
          <h2 className="mt-3 font-display text-lg font-semibold text-strong">Something went wrong on this page</h2>
          <p className="mt-1 text-sm text-muted">The map and other pages keep working.</p>
          <button type="button" onClick={() => this.setState({ error: null })} className="mt-4 rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white">
            Try again
          </button>
        </div>
      </div>
    );
  }
}

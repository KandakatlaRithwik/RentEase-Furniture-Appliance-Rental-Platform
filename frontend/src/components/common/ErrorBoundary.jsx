import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('ErrorBoundary:', error, info); }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-ink-50 dark:bg-dm-bg">
          <div className="text-center px-6 max-w-md">
            <div className="text-6xl mb-4">💥</div>
            <h2 className="font-head text-2xl font-bold mb-2">Something crashed</h2>
            <p className="text-ink-500 text-sm mb-6">{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <button onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition-colors">
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

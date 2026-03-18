import { Component } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Could log to a service here if needed
    console.error("MicroID ErrorBoundary caught:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-5 p-8 text-center bg-slate-50 dark:bg-slate-900">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Something went wrong
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            An unexpected error occurred. Your investigation data is saved in your browser — try reloading or tapping below to recover.
          </p>
          {this.state.error?.message && (
            <p className="mt-3 text-xs font-mono text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 max-w-sm mx-auto">
              {this.state.error.message}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-5 py-2.5 bg-usafa-blue hover:bg-usafa-blue-light text-white rounded-xl text-sm font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:border-slate-400 transition-colors"
          >
            Reload App
          </button>
        </div>
      </div>
    );
  }
}

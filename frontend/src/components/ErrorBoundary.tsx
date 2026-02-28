import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch and handle React component errors gracefully.
 * Prevents the entire app from crashing when a component throws an error.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h1 className="text-2xl font-bold text-red-600 mb-4">
                Нещо се обърка
              </h1>
              <p className="text-gray-600 mb-4">
                Възникна неочаквана грешка. Моля, опитайте да презаредите страницата.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Презареди страницата
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

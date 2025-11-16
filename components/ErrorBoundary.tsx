'use client';

import { Component, ReactNode } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="max-w-md mx-auto mt-8">
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Wystąpił błąd
            </h2>
            <p className="text-gray-600 mb-4">
              Przepraszamy, coś poszło nie tak. Spróbuj odświeżyć stronę.
            </p>
            {this.state.error && (
              <details className="text-left text-sm text-gray-500 bg-gray-50 p-3 rounded mb-4">
                <summary className="cursor-pointer">Szczegóły błędu</summary>
                <pre className="mt-2 whitespace-pre-wrap">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Odśwież stronę
            </Button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

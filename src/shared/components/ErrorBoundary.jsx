import { Component } from "react";

/*
 * Catches an error thrown while rendering the wrapped part of the app and
 * shows a message instead of a blank screen.
 *
 *   variant="page" (default): message inside the page area; the header and
 *     menu stay usable. Give it key={location.pathname} so moving to another
 *     page starts fresh.
 *   variant="app": full-screen message, for errors outside the page area.
 *
 * Only render errors are caught; errors in event handlers and API calls are
 * handled where they happen (see errorHandler.js).
 */
class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error(
      `[ErrorBoundary:${this.props.variant || "page"}]`,
      error,
      info?.componentStack,
    );
  }

  handleRetry = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const isApp = this.props.variant === "app";
    const showDetails = import.meta.env.DEV;

    return (
      <div
        role="alert"
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: isApp ? "100vh" : "50vh", padding: "24px" }}
      >
        <div className="card" style={{ maxWidth: "560px", width: "100%" }}>
          <div className="card-body text-center p-4">
            <i className="fas fa-exclamation-triangle text-warning mb-3" style={{ fontSize: "36px" }} aria-hidden="true" />
            <h5 className="mb-2">Something went wrong</h5>
            <p className="text-muted mb-4">
              {isApp
                ? "The application could not be displayed. Please reload the page."
                : "This page could not be displayed. You can try again or go to another page from the menu."}
            </p>

            {/* Error text for developers only (not shown in production builds). */}
            {showDetails && (
              <pre
                className="text-start text-danger small bg-light p-2 mb-4"
                style={{ whiteSpace: "pre-wrap", maxHeight: "160px", overflow: "auto" }}
              >
                {String(error?.message || error)}
              </pre>
            )}

            <div className="d-flex justify-content-center gap-2">
              {!isApp && (
                <button type="button" className="btn btn-outline-secondary" onClick={this.handleRetry}>
                  Try Again
                </button>
              )}
              <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;

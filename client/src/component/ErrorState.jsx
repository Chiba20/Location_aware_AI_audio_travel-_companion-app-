function ErrorState({ message, onRetry }) {
  const isTimeout = message?.toLowerCase().includes("taking a little longer");

  return (
    <div className={`state-panel error-panel ${isTimeout ? "timeout-panel" : ""}`} role="alert">
      {isTimeout && <strong>Almost there</strong>}
      <p>{message}</p>
      {onRetry && (
        <button className="secondary-btn" type="button" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export default ErrorState;

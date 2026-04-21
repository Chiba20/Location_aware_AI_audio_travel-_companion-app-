function ErrorState({ message, onRetry }) {
  return (
    <div className="state-panel error-panel" role="alert">
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

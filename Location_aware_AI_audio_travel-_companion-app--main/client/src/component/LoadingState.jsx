function LoadingState({ label = "Loading" }) {
  return (
    <div className="state-panel" role="status">
      <span className="loader" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export default LoadingState;

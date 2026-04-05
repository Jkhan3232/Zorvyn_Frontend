export function ErrorState({ message, onRetry }) {
  return (
    <section className="state-card state-error">
      <h3>Something failed</h3>
      <p>{message}</p>
      {onRetry ? (
        <button type="button" className="primary-btn" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </section>
  );
}

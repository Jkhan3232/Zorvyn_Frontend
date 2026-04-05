export function LoadingState({ label = "Loading..." }) {
  return (
    <section className="state-card">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </section>
  );
}

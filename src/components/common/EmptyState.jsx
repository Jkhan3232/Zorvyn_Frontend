export function EmptyState({ title, message }) {
  return (
    <section className="state-card">
      <h3>{title}</h3>
      <p>{message}</p>
    </section>
  );
}

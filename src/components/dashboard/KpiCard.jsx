import { formatCurrency } from "../../lib/format.js";

export function KpiCard({ label, value, tone = "neutral" }) {
  return (
    <article className={`kpi-card kpi-${tone}`}>
      <p>{label}</p>
      <h3>{formatCurrency(value)}</h3>
    </article>
  );
}

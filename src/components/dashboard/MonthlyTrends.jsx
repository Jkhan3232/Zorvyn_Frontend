import { formatCurrency } from "../../lib/format.js";

export function MonthlyTrends({ items }) {
  const maxValue = Math.max(...items.map((item) => item.total), 1);

  return (
    <section className="panel">
      <div className="panel-head">
        <h3>Monthly Trends</h3>
      </div>

      <div className="list-stack">
        {items.map((item) => (
          <div key={item.id} className="list-row">
            <div>
              <strong>{item.month}</strong>
              <div className="meter">
                <span
                  style={{
                    width: `${Math.max((item.total / maxValue) * 100, 4)}%`,
                  }}
                />
              </div>
            </div>
            <strong>{formatCurrency(item.total)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

import { formatCurrency, formatDate } from "../../lib/format.js";

export function RecentTransactions({ rows }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h3>Recent Transactions</h3>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td data-label="Date">{formatDate(row.date)}</td>
                <td data-label="Category">{row.category || "Uncategorized"}</td>
                <td data-label="Type">
                  <span className={`tag tag-${row.type || "expense"}`}>
                    {row.type || "expense"}
                  </span>
                </td>
                <td data-label="Amount">{formatCurrency(row.amount)}</td>
                <td data-label="Note">{row.note || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

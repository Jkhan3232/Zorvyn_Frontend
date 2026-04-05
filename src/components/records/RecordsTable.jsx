import { formatCurrency, formatDate } from "../../lib/format.js";

const SORTABLE_COLUMNS = {
  date: "Date",
  amount: "Amount",
  category: "Category",
  createdAt: "Created",
};

function getRecordId(record) {
  return record?._id || record?.id || `${record?.date}-${record?.amount}`;
}

export function RecordsTable({ records, sortBy, sortOrder, onSort }) {
  function renderSortableHeader(field) {
    const isActive = sortBy === field;
    const indicator = isActive ? (sortOrder === "asc" ? " ↑" : " ↓") : "";

    return (
      <button
        type="button"
        className={`sort-btn${isActive ? " sort-btn-active" : ""}`}
        onClick={() => onSort(field)}
      >
        {SORTABLE_COLUMNS[field]}
        {indicator}
      </button>
    );
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <h3>Records</h3>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>{renderSortableHeader("date")}</th>
              <th>{renderSortableHeader("category")}</th>
              <th>Type</th>
              <th>{renderSortableHeader("amount")}</th>
              <th>Note</th>
              <th>{renderSortableHeader("createdAt")}</th>
            </tr>
          </thead>

          <tbody>
            {records.map((record) => (
              <tr key={getRecordId(record)}>
                <td>{formatDate(record.date)}</td>
                <td>{record.category || "Uncategorized"}</td>
                <td>
                  <span className={`tag tag-${record.type || "expense"}`}>
                    {record.type || "expense"}
                  </span>
                </td>
                <td>{formatCurrency(record.amount)}</td>
                <td>{record.note || record.description || "-"}</td>
                <td>{formatDate(record.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

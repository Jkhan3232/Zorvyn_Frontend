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
                <td data-label="Date">{formatDate(record.date)}</td>
                <td data-label="Category">
                  {record.category || "Uncategorized"}
                </td>
                <td data-label="Type">
                  <span className={`tag tag-${record.type || "expense"}`}>
                    {record.type || "expense"}
                  </span>
                </td>
                <td data-label="Amount">{formatCurrency(record.amount)}</td>
                <td data-label="Note">
                  {record.note || record.description || "-"}
                </td>
                <td data-label="Created">{formatDate(record.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

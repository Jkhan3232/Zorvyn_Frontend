import { formatCurrency, formatDate } from "../../lib/format.js";

function getRecordId(record) {
  return record?._id || record?.id;
}

export function AdminRecordsTable({
  records,
  deletingRecordId,
  onEdit,
  onDelete,
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h3>Record Management</h3>
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
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {records.map((record) => {
              const recordId = getRecordId(record);
              const isDeleting = deletingRecordId === recordId;

              return (
                <tr key={recordId}>
                  <td>{formatDate(record.date)}</td>
                  <td>{record.category || "Uncategorized"}</td>
                  <td>
                    <span className={`tag tag-${record.type || "expense"}`}>
                      {record.type || "expense"}
                    </span>
                  </td>
                  <td>{formatCurrency(record.amount)}</td>
                  <td>{record.note || record.description || "-"}</td>
                  <td>
                    <div className="actions-row">
                      <button
                        type="button"
                        className="ghost-btn"
                        onClick={() => onEdit(record)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="danger-btn"
                        disabled={isDeleting}
                        onClick={() => onDelete(record)}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

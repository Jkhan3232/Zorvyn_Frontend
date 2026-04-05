import { useState } from "react";
import { toInputDate } from "../../lib/format.js";

function getTodayDateInput() {
  return new Date().toISOString().slice(0, 10);
}

const INITIAL_FORM = {
  amount: "",
  type: "expense",
  category: "",
  date: getTodayDateInput(),
  note: "",
};

function mapRecordToForm(record) {
  if (!record) {
    return INITIAL_FORM;
  }

  return {
    amount: record.amount ?? "",
    type: record.type || "expense",
    category: record.category || "",
    date: toInputDate(record.date) || getTodayDateInput(),
    note: record.note || record.description || "",
  };
}

export function RecordFormModal({
  initialValues,
  isSubmitting,
  onCancel,
  onSubmit,
}) {
  const [form, setForm] = useState(() => mapRecordToForm(initialValues));
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Amount should be a valid number greater than zero.");
      return;
    }

    if (!form.category.trim()) {
      setError("Category is required.");
      return;
    }

    const noteText = form.note.trim();

    const payload = {
      amount,
      type: form.type === "income" ? "income" : "expense",
      category: form.category.trim(),
      date: form.date,
      note: noteText || undefined,
      description: noteText || undefined,
    };

    await onSubmit(payload);
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="modal-card">
        <h3>{initialValues ? "Update record" : "Create record"}</h3>

        <form className="modal-grid" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Amount</span>
            <input
              type="number"
              min="1"
              step="0.01"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Type</span>
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>

          <label className="field full-col">
            <span className="field-label">Category</span>
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Date</span>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Note (optional)</span>
            <input
              type="text"
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Short note"
            />
          </label>

          {error ? <p className="helper-error full-col">{error}</p> : null}

          <div className="actions-row full-col">
            <button
              type="submit"
              className="primary-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className="muted-btn"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

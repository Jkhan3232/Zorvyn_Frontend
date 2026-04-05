export function RecordsFilters({
  filters,
  categories,
  onFiltersChange,
  onApply,
  onReset,
}) {
  function handleChange(event) {
    const { name, value } = event.target;
    onFiltersChange((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onApply();
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <h3>Record Filters</h3>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field-label">Start Date</span>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleChange}
          />
        </label>

        <label className="field">
          <span className="field-label">End Date</span>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleChange}
          />
        </label>

        <label className="field">
          <span className="field-label">Category</span>
          <select
            name="category"
            value={filters.category}
            onChange={handleChange}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">Type</span>
          <select name="type" value={filters.type} onChange={handleChange}>
            <option value="">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </label>

        <label className="field">
          <span className="field-label">Search</span>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Search category or note"
          />
        </label>

        <div className="actions-row">
          <button type="submit" className="primary-btn">
            Apply
          </button>
          <button type="button" className="muted-btn" onClick={onReset}>
            Reset
          </button>
        </div>
      </form>
    </section>
  );
}

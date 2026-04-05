import { useCallback, useEffect, useMemo, useState } from "react";
import { getReadableError } from "../api/client.js";
import { EmptyState } from "../components/common/EmptyState.jsx";
import { ErrorState } from "../components/common/ErrorState.jsx";
import { LoadingState } from "../components/common/LoadingState.jsx";
import { useToast } from "../hooks/useToast.js";
import { RecordsFilters } from "../components/records/RecordsFilters.jsx";
import { RecordsTable } from "../components/records/RecordsTable.jsx";
import { fetchRecords } from "../services/recordsService.js";

const BASE_FILTERS = {
  startDate: "",
  endDate: "",
  category: "",
  type: "",
  search: "",
};

const BASE_QUERY = {
  ...BASE_FILTERS,
  page: 1,
  limit: 10,
  sortBy: "date",
  sortOrder: "desc",
};

export function RecordsPage() {
  const toast = useToast();
  const [filters, setFilters] = useState(BASE_FILTERS);
  const [query, setQuery] = useState(BASE_QUERY);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [categories, setCategories] = useState([]);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetchRecords(query);
      setRecords(response.records);
      setPagination(response.pagination);

      const fetchedCategories = response.records
        .map((record) => record.category)
        .filter(Boolean);

      setCategories((prev) => {
        const merged = new Set([...prev, ...fetchedCategories]);
        return Array.from(merged).sort();
      });
    } catch (requestError) {
      const message = getReadableError(
        requestError,
        "Failed to fetch records.",
      );
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [query, toast]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  function applyFilters() {
    setQuery((prev) => ({
      ...prev,
      ...filters,
      page: 1,
    }));
  }

  function resetFilters() {
    setFilters(BASE_FILTERS);
    setQuery(BASE_QUERY);
  }

  function handleSort(field) {
    setQuery((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder:
        prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc",
      page: 1,
    }));
  }

  function goToPage(page) {
    setQuery((prev) => ({
      ...prev,
      page,
    }));
  }

  const showingSummary = useMemo(() => {
    if (!records.length) {
      return "Showing 0 records";
    }

    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = start + records.length - 1;

    return `Showing ${start}-${end} of ${pagination.total}`;
  }, [pagination, records.length]);

  return (
    <>
      <section className="page-head">
        <div>
          <p className="eyebrow">Records</p>
          <h2>Transaction Records</h2>
          <p className="subtle">
            View, filter, sort and paginate records from /api/records.
          </p>
        </div>
      </section>

      <RecordsFilters
        filters={filters}
        categories={categories}
        onFiltersChange={setFilters}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      {loading ? <LoadingState label="Loading records..." /> : null}

      {!loading && error ? (
        <ErrorState message={error} onRetry={loadRecords} />
      ) : null}

      {!loading && !error && !records.length ? (
        <EmptyState
          title="No records found"
          message="Try changing the filters or reset to view all records."
        />
      ) : null}

      {!loading && !error && records.length ? (
        <>
          <RecordsTable
            records={records}
            sortBy={query.sortBy}
            sortOrder={query.sortOrder}
            onSort={handleSort}
          />

          <section className="panel">
            <div className="pagination-row">
              <p>{showingSummary}</p>
              <div className="actions-row">
                <button
                  type="button"
                  className="muted-btn"
                  onClick={() => goToPage(Math.max(1, pagination.page - 1))}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </button>
                <p>
                  Page {pagination.page} / {pagination.totalPages}
                </p>
                <button
                  type="button"
                  className="muted-btn"
                  onClick={() =>
                    goToPage(
                      Math.min(pagination.totalPages, pagination.page + 1),
                    )
                  }
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </>
      ) : null}
    </>
  );
}

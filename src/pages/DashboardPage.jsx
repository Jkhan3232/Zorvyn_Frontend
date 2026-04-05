import { useCallback, useEffect, useState } from "react";
import { getReadableError } from "../api/client.js";
import { CategoryTotals } from "../components/dashboard/CategoryTotals.jsx";
import { KpiCard } from "../components/dashboard/KpiCard.jsx";
import { MonthlyTrends } from "../components/dashboard/MonthlyTrends.jsx";
import { RecentTransactions } from "../components/dashboard/RecentTransactions.jsx";
import { EmptyState } from "../components/common/EmptyState.jsx";
import { ErrorState } from "../components/common/ErrorState.jsx";
import { LoadingState } from "../components/common/LoadingState.jsx";
import { useToast } from "../hooks/useToast.js";
import { fetchDashboardBundle } from "../services/dashboardService.js";

function toNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function pickNumber(source, keys) {
  for (const key of keys) {
    const currentValue = source?.[key];
    const numericValue = Number(currentValue);
    if (Number.isFinite(numericValue)) {
      return numericValue;
    }
  }

  return 0;
}

function normalizeCategoryTotals(payload) {
  const items = Array.isArray(payload)
    ? payload
    : payload?.categories || payload?.totals || payload?.items || [];

  return items.map((item, index) => ({
    id: item?._id || item?.id || `${item?.category || "category"}-${index}`,
    category: item?.category || item?.name || "Uncategorized",
    total: toNumber(item?.total ?? item?.amount ?? item?.value),
  }));
}

function normalizeMonthlyTrends(payload) {
  const items = Array.isArray(payload)
    ? payload
    : payload?.months || payload?.trends || payload?.items || [];

  return items.map((item, index) => ({
    id: item?._id || item?.id || `${item?.month || "month"}-${index}`,
    month: item?.month || item?.label || `Month ${index + 1}`,
    total: toNumber(item?.total ?? item?.amount ?? item?.value ?? item?.net),
  }));
}

function normalizeRecentTransactions(payload) {
  const items = Array.isArray(payload)
    ? payload
    : payload?.transactions || payload?.records || payload?.items || [];

  return items.map((item, index) => ({
    id: item?._id || item?.id || `${item?.date || "recent"}-${index}`,
    date: item?.date || item?.createdAt,
    category: item?.category,
    type: item?.type,
    amount: toNumber(item?.amount),
    note: item?.note || item?.description,
  }));
}

export function DashboardPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState({
    totals: {
      income: 0,
      expense: 0,
      balance: 0,
    },
    categoryTotals: [],
    monthlyTrends: [],
    recentTransactions: [],
    summary: {},
  });

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const bundle = await fetchDashboardBundle();

      setDashboard({
        totals: {
          income: pickNumber(bundle.totalIncome, [
            "totalIncome",
            "income",
            "total",
            "value",
          ]),
          expense: pickNumber(bundle.totalExpense, [
            "totalExpense",
            "expense",
            "total",
            "value",
          ]),
          balance: pickNumber(bundle.netBalance, [
            "netBalance",
            "balance",
            "total",
            "value",
          ]),
        },
        categoryTotals: normalizeCategoryTotals(bundle.categoryTotals),
        monthlyTrends: normalizeMonthlyTrends(bundle.monthlyTrends),
        recentTransactions: normalizeRecentTransactions(
          bundle.recentTransactions,
        ),
        summary: bundle.summary || {},
      });
    } catch (requestError) {
      const message = getReadableError(
        requestError,
        "Failed to load dashboard endpoints.",
      );
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return <LoadingState label="Fetching dashboard metrics..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadDashboard} />;
  }

  return (
    <>
      <section className="page-head">
        <div>
          <p className="eyebrow">Overview</p>
          <h2>Finance Dashboard</h2>
          <p className="subtle">Live data from all dashboard REST endpoints.</p>
        </div>
        <button type="button" className="primary-btn" onClick={loadDashboard}>
          Refresh
        </button>
      </section>

      <section className="kpi-grid">
        <KpiCard
          label="Total Income"
          value={dashboard.totals.income}
          tone="positive"
        />
        <KpiCard
          label="Total Expense"
          value={dashboard.totals.expense}
          tone="negative"
        />
        <KpiCard
          label="Net Balance"
          value={dashboard.totals.balance}
          tone="neutral"
        />
      </section>

      <section className="grid-two">
        {dashboard.categoryTotals.length ? (
          <CategoryTotals items={dashboard.categoryTotals} />
        ) : (
          <EmptyState
            title="No category totals"
            message="Backend returned no category totals data yet."
          />
        )}

        {dashboard.monthlyTrends.length ? (
          <MonthlyTrends items={dashboard.monthlyTrends} />
        ) : (
          <EmptyState
            title="No monthly trend data"
            message="Monthly trend endpoint returned no rows."
          />
        )}
      </section>

      {dashboard.recentTransactions.length ? (
        <RecentTransactions rows={dashboard.recentTransactions} />
      ) : (
        <EmptyState
          title="No recent transactions"
          message="Recent transactions endpoint returned an empty list."
        />
      )}

      <section className="panel">
        <div className="panel-head">
          <h3>Summary Snapshot</h3>
        </div>
        <pre>{JSON.stringify(dashboard.summary, null, 2)}</pre>
      </section>
    </>
  );
}

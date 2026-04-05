import { apiClient, graphqlClient } from "../api/client.js";
import { unwrapApiData } from "../lib/http.js";

async function fetchDashboardMetric(path) {
  const response = await apiClient.get(path);
  return unwrapApiData(response.data);
}

export function fetchTotalIncome() {
  return fetchDashboardMetric("/dashboard/total-income");
}

export function fetchTotalExpense() {
  return fetchDashboardMetric("/dashboard/total-expense");
}

export function fetchNetBalance() {
  return fetchDashboardMetric("/dashboard/net-balance");
}

export function fetchCategoryTotals() {
  return fetchDashboardMetric("/dashboard/category-totals");
}

export function fetchMonthlyTrends() {
  return fetchDashboardMetric("/dashboard/monthly-trends");
}

export function fetchRecentTransactions() {
  return fetchDashboardMetric("/dashboard/recent-transactions");
}

export function fetchSummary() {
  return fetchDashboardMetric("/dashboard/summary");
}

export async function fetchDashboardBundle() {
  const [
    totalIncome,
    totalExpense,
    netBalance,
    categoryTotals,
    monthlyTrends,
    recentTransactions,
    summary,
  ] = await Promise.all([
    fetchTotalIncome(),
    fetchTotalExpense(),
    fetchNetBalance(),
    fetchCategoryTotals(),
    fetchMonthlyTrends(),
    fetchRecentTransactions(),
    fetchSummary(),
  ]);

  return {
    totalIncome,
    totalExpense,
    netBalance,
    categoryTotals,
    monthlyTrends,
    recentTransactions,
    summary,
  };
}

export async function runGraphqlQuery(query, variables = {}) {
  const response = await graphqlClient.post("/graphql", {
    query,
    variables,
  });

  return unwrapApiData(response.data);
}

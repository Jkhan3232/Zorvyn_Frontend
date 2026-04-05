import { apiClient } from "../api/client.js";
import {
  cleanQueryParams,
  normalizeRecordsResponse,
  unwrapApiData,
} from "../lib/http.js";

function normalizeType(type) {
  return String(type).toLowerCase() === "income" ? "income" : "expense";
}

function toIsoDate(value) {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return undefined;
  }

  return parsedDate.toISOString();
}

function normalizeRecordPayload(payload = {}, options = {}) {
  const { includeDateFallback = false } = options;

  const numericAmount = Number(payload.amount);
  const noteText = String(payload.note ?? payload.description ?? "").trim();

  const normalizedPayload = {
    amount: Number.isFinite(numericAmount) ? numericAmount : payload.amount,
    type: normalizeType(payload.type),
    category: String(payload.category ?? "").trim(),
  };

  const normalizedDate = payload.date
    ? toIsoDate(payload.date)
    : includeDateFallback
      ? new Date().toISOString()
      : undefined;

  if (normalizedDate) {
    normalizedPayload.date = normalizedDate;
  }

  if (noteText) {
    normalizedPayload.note = noteText;
    normalizedPayload.description = noteText;
  }

  return normalizedPayload;
}

export async function fetchRecords(params = {}) {
  const response = await apiClient.get("/records", {
    params: cleanQueryParams(params),
  });

  return normalizeRecordsResponse(response.data);
}

export async function createRecord(payload) {
  const response = await apiClient.post(
    "/records",
    normalizeRecordPayload(payload, { includeDateFallback: true }),
  );
  return unwrapApiData(response.data);
}

export async function updateRecord(recordId, payload) {
  const response = await apiClient.patch(
    `/records/${recordId}`,
    normalizeRecordPayload(payload),
  );
  return unwrapApiData(response.data);
}

export async function deleteRecord(recordId) {
  const response = await apiClient.delete(`/records/${recordId}`);
  return unwrapApiData(response.data);
}

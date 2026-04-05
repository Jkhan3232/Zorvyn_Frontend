import axios from "axios";
import { API_BASE_URL, REST_BASE_PATH } from "../config/env.js";
import { clearStoredAuth, getStoredAuth } from "../lib/storage.js";

const STATUS_ERROR_MESSAGE = {
  400: "Bad request. Please verify your input.",
  401: "Session expired. Please login again.",
  403: "You are not allowed to perform this action.",
  404: "Requested resource was not found.",
  500: "Server error. Please try again in a few moments.",
};

function extractServerErrorMessage(error) {
  const responseData = error?.response?.data;
  const candidates = [
    responseData?.message,
    responseData?.error,
    responseData?.error?.message,
    responseData?.errors?.[0]?.message,
  ];

  const directMessage = candidates.find((item) => {
    return typeof item === "string" && item.trim();
  });

  if (directMessage) {
    return directMessage;
  }

  const statusCode = error?.response?.status;
  return (
    STATUS_ERROR_MESSAGE[statusCode] || "Something went wrong. Please retry."
  );
}

function applyAuthHeader(config) {
  const nextConfig = {
    ...config,
    headers: {
      ...(config?.headers || {}),
    },
  };

  const { token } = getStoredAuth();
  if (token) {
    nextConfig.headers.Authorization = `Bearer ${token}`;
  }

  return nextConfig;
}

function handleHttpError(error) {
  const statusCode = error?.response?.status;
  error.userMessage = extractServerErrorMessage(error);

  if (statusCode === 401) {
    clearStoredAuth();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
  }

  return Promise.reject(error);
}

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${REST_BASE_PATH}`,
  timeout: 20000,
});

apiClient.interceptors.request.use(applyAuthHeader, (error) =>
  Promise.reject(error),
);
apiClient.interceptors.response.use((response) => response, handleHttpError);

export const graphqlClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

graphqlClient.interceptors.request.use(
  (config) => {
    const nextConfig = applyAuthHeader(config);
    nextConfig.headers["Content-Type"] = "application/json";
    return nextConfig;
  },
  (error) => Promise.reject(error),
);
graphqlClient.interceptors.response.use(
  (response) => response,
  handleHttpError,
);

export function getReadableError(error, fallback = "Request failed.") {
  return error?.userMessage || fallback;
}

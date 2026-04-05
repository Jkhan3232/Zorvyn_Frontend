import axios from "axios";
import { API_BASE_URL, REST_BASE_PATH } from "../config/env.js";
import {
  clearStoredAuth,
  getStoredAuth,
  setStoredAccessToken,
} from "../lib/storage.js";
import { unwrapApiData } from "../lib/http.js";

const STATUS_ERROR_MESSAGE = {
  400: "Bad request. Please verify your input.",
  401: "Session expired. Please login again.",
  403: "You are not allowed to perform this action.",
  404: "Requested resource was not found.",
  500: "Server error. Please try again in a few moments.",
};

const AUTH_BYPASS_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh-token",
  "/auth/logout",
];

let refreshPromise = null;

function getRequestPath(url = "") {
  if (typeof url !== "string") {
    return "";
  }

  if (/^https?:\/\//i.test(url)) {
    try {
      return new URL(url).pathname || "";
    } catch {
      return url;
    }
  }

  return url;
}

function isAuthBypassRequest(config) {
  if (config?.requiresAuth === false) {
    return true;
  }

  const path = getRequestPath(config?.url);
  return AUTH_BYPASS_PATHS.some((route) => path.includes(route));
}

function getAccessTokenFromStorage() {
  const { accessToken, token } = getStoredAuth();
  return String(accessToken || token || "").trim();
}

function notifyUnauthorized() {
  clearStoredAuth();

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
  }
}

function extractValidationErrors(error) {
  const errors = error?.response?.data?.errors;
  if (!Array.isArray(errors)) {
    return {};
  }

  const fieldAliases = {
    isActive: "status",
  };

  return errors.reduce((accumulator, item) => {
    const rawField = String(item?.field || "").trim() || "form";
    const field = fieldAliases[rawField] || rawField;
    const message = String(item?.message || "").trim();

    if (!message || accumulator[field]) {
      return accumulator;
    }

    return {
      ...accumulator,
      [field]: message,
    };
  }, {});
}

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

function withJsonHeaders(headers = {}) {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...headers,
  };
}

function applyAuthHeader(config) {
  const nextConfig = {
    ...config,
    headers: withJsonHeaders(config?.headers || {}),
  };

  if (isAuthBypassRequest(nextConfig)) {
    delete nextConfig.headers.Authorization;
    return nextConfig;
  }

  const accessToken = getAccessTokenFromStorage();
  if (accessToken) {
    nextConfig.headers.Authorization = `Bearer ${accessToken}`;
  }

  return nextConfig;
}

function shouldAttemptRefresh(error) {
  const statusCode = error?.response?.status;
  const requestConfig = error?.config;

  if (statusCode !== 401 || !requestConfig) {
    return false;
  }

  if (requestConfig._retry) {
    return false;
  }

  if (isAuthBypassRequest(requestConfig)) {
    return false;
  }

  const refreshToken = String(getStoredAuth().refreshToken || "").trim();
  return Boolean(refreshToken);
}

const refreshClient = axios.create({
  baseURL: `${API_BASE_URL}${REST_BASE_PATH}`,
  timeout: 20000,
  headers: withJsonHeaders(),
});

async function performRefreshTokenRequest() {
  const refreshToken = String(getStoredAuth().refreshToken || "").trim();
  if (!refreshToken) {
    throw new Error("Missing refresh token.");
  }

  const response = await refreshClient.post(
    "/auth/refresh-token",
    { refreshToken },
    {
      headers: {
        "x-refresh-token": refreshToken,
      },
    },
  );

  const data = unwrapApiData(response.data);
  const nextAccessToken = String(data?.accessToken || data?.token || "").trim();

  if (!nextAccessToken) {
    throw new Error("Missing access token in refresh response.");
  }

  setStoredAccessToken(nextAccessToken);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("auth:token-refreshed", {
        detail: {
          accessToken: nextAccessToken,
        },
      }),
    );
  }

  return nextAccessToken;
}

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = performRefreshTokenRequest().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

async function handleHttpError(error) {
  const statusCode = error?.response?.status;
  error.userMessage = extractServerErrorMessage(error);
  error.fieldErrors = extractValidationErrors(error);

  if (shouldAttemptRefresh(error)) {
    try {
      const nextAccessToken = await refreshAccessToken();
      const originalRequest = {
        ...error.config,
        _retry: true,
        headers: {
          ...(error.config?.headers || {}),
          Authorization: `Bearer ${nextAccessToken}`,
        },
      };

      return apiClient.request(originalRequest);
    } catch {
      notifyUnauthorized();
      return Promise.reject(error);
    }
  }

  if (statusCode === 401 && !isAuthBypassRequest(error?.config)) {
    notifyUnauthorized();
  }

  return Promise.reject(error);
}

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${REST_BASE_PATH}`,
  timeout: 20000,
  headers: withJsonHeaders(),
});

apiClient.interceptors.request.use(applyAuthHeader, (error) =>
  Promise.reject(error),
);
apiClient.interceptors.response.use((response) => response, handleHttpError);

export const graphqlClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: withJsonHeaders(),
});

graphqlClient.interceptors.request.use(applyAuthHeader, (error) =>
  Promise.reject(error),
);
graphqlClient.interceptors.response.use(
  (response) => response,
  handleHttpError,
);

export const publicApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: withJsonHeaders(),
});

export function getReadableError(error, fallback = "Request failed.") {
  return error?.userMessage || fallback;
}

export function getFieldErrors(error) {
  return error?.fieldErrors || {};
}

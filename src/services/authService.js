import { apiClient } from "../api/client.js";
import { unwrapApiData } from "../lib/http.js";
import { getRefreshToken as getStoredRefreshToken } from "../lib/tokenManager.js";

/** @typedef {import("../types/authAdminApi").LoginRequest} LoginRequest */
/** @typedef {import("../types/authAdminApi").LoginData} LoginData */
/** @typedef {import("../types/authAdminApi").RefreshTokenData} RefreshTokenData */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mapBackendRoleToFrontend(role) {
  const normalizedRole = String(role || "").toLowerCase();

  if (normalizedRole === "staff") {
    return "analyst";
  }

  if (normalizedRole === "user") {
    return "viewer";
  }

  if (["admin", "analyst", "viewer"].includes(normalizedRole)) {
    return normalizedRole;
  }

  return "viewer";
}

function normalizeUser(user) {
  if (!user || typeof user !== "object") {
    return null;
  }

  return {
    ...user,
    role: mapBackendRoleToFrontend(user.role),
    isActive: typeof user.isActive === "boolean" ? user.isActive : true,
  };
}

function normalizeAuthResponse(data) {
  const accessToken = String(data?.accessToken || data?.token || "").trim();
  const refreshToken = String(data?.refreshToken || "").trim();
  const user = normalizeUser(data?.user);

  return {
    token: accessToken,
    accessToken,
    refreshToken,
    user,
  };
}

function validateLoginPayload(payload = {}) {
  const email = String(payload?.email || "")
    .trim()
    .toLowerCase();
  const password = String(payload?.password || "");

  if (!EMAIL_PATTERN.test(email)) {
    throw new Error("Please enter a valid email address.");
  }

  if (!password) {
    throw new Error("Password is required.");
  }

  return { email, password };
}

function resolveRefreshToken(refreshTokenValue) {
  const resolved = String(
    refreshTokenValue || getStoredRefreshToken() || "",
  ).trim();

  if (!resolved) {
    throw new Error("Refresh token is required.");
  }

  return resolved;
}

export async function registerUser(payload) {
  const response = await apiClient.post("/auth/register", payload, {
    requiresAuth: false,
  });
  return unwrapApiData(response.data);
}

/**
 * @param {LoginRequest} payload
 * @returns {Promise<LoginData>}
 */
export async function login(payload) {
  const normalizedPayload = validateLoginPayload(payload);
  const response = await apiClient.post("/auth/login", normalizedPayload, {
    requiresAuth: false,
  });
  const data = unwrapApiData(response.data);
  const auth = normalizeAuthResponse(data);

  if (!auth.accessToken || !auth.refreshToken || !auth.user) {
    throw new Error("Invalid login response from server.");
  }

  return auth;
}

/**
 * @param {string} [refreshTokenValue]
 * @returns {Promise<RefreshTokenData>}
 */
export async function refreshToken(refreshTokenValue) {
  const resolvedRefreshToken = resolveRefreshToken(refreshTokenValue);
  const response = await apiClient.post(
    "/auth/refresh-token",
    {
      refreshToken: resolvedRefreshToken,
    },
    {
      requiresAuth: false,
      headers: {
        "x-refresh-token": resolvedRefreshToken,
      },
    },
  );

  const data = unwrapApiData(response.data);
  const accessToken = String(data?.accessToken || data?.token || "").trim();

  if (!accessToken) {
    throw new Error("Invalid refresh token response from server.");
  }

  return {
    token: accessToken,
    accessToken,
  };
}

/**
 * @param {string} [refreshTokenValue]
 * @returns {Promise<Record<string, unknown>>}
 */
export async function logout(refreshTokenValue) {
  const resolvedRefreshToken = resolveRefreshToken(refreshTokenValue);

  const response = await apiClient.post(
    "/auth/logout",
    {
      refreshToken: resolvedRefreshToken,
    },
    {
      requiresAuth: false,
      headers: {
        "x-refresh-token": resolvedRefreshToken,
      },
    },
  );

  return unwrapApiData(response.data);
}

export async function loginUser(payload) {
  return login(payload);
}

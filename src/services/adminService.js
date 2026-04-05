import { apiClient } from "../api/client.js";
import { unwrapApiData } from "../lib/http.js";
import { getStoredAuth } from "../lib/storage.js";

/** @typedef {import("../types/authAdminApi").UpdateAdminProfileRequest} UpdateAdminProfileRequest */
/** @typedef {import("../types/authAdminApi").UpdateUserByAdminRequest} UpdateUserByAdminRequest */
/** @typedef {import("../types/authAdminApi").AuthUser} AuthUser */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MONGODB_ID_PATTERN = /^[a-f\d]{24}$/i;
const ALLOWED_FRONTEND_ROLES = ["admin", "analyst", "viewer"];
const ALLOWED_STATUSES = ["active", "inactive"];

function mapBackendRoleToFrontend(role) {
  const normalizedRole = String(role || "").toLowerCase();

  if (normalizedRole === "staff") {
    return "analyst";
  }

  if (normalizedRole === "user") {
    return "viewer";
  }

  if (ALLOWED_FRONTEND_ROLES.includes(normalizedRole)) {
    return normalizedRole;
  }

  return "viewer";
}

function mapFrontendRoleToBackend(role) {
  const normalizedRole = String(role || "").toLowerCase();

  if (normalizedRole === "analyst") {
    return "staff";
  }

  if (normalizedRole === "viewer") {
    return "user";
  }

  return "admin";
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

function extractUpdatedUser(payload) {
  const data = unwrapApiData(payload);

  const userCandidate = data?.user || data;
  return normalizeUser(userCandidate);
}

function assertAdminActor() {
  const currentRole = mapBackendRoleToFrontend(getStoredAuth()?.user?.role);

  if (currentRole !== "admin") {
    const error = new Error("Admin role is required for this action.");
    error.userMessage = "Admin role is required for this action.";
    throw error;
  }
}

function validateCommonName(name, label = "Name") {
  const normalized = String(name || "").trim();

  if (normalized.length < 2 || normalized.length > 100) {
    throw new Error(`${label} must be between 2 and 100 characters.`);
  }

  return normalized;
}

function validateEmail(email) {
  const normalized = String(email || "")
    .trim()
    .toLowerCase();

  if (!EMAIL_PATTERN.test(normalized)) {
    throw new Error("Please enter a valid email address.");
  }

  return normalized;
}

function validatePassword(password) {
  const normalized = String(password || "");

  if (normalized.length < 6 || normalized.length > 50) {
    throw new Error("Password must be between 6 and 50 characters.");
  }

  return normalized;
}

function buildAdminProfilePayload(payload = {}) {
  const result = {};

  if (payload.name !== undefined) {
    result.name = validateCommonName(payload.name);
  }

  if (payload.email !== undefined) {
    result.email = validateEmail(payload.email);
  }

  if (payload.password !== undefined) {
    result.password = validatePassword(payload.password);
  }

  if (!Object.keys(result).length) {
    throw new Error("At least one profile field is required.");
  }

  return result;
}

function buildAdminUserPayload(payload = {}) {
  const result = {};

  if (payload.name !== undefined) {
    result.name = validateCommonName(payload.name, "User name");
  }

  if (payload.email !== undefined) {
    result.email = validateEmail(payload.email);
  }

  if (payload.role !== undefined) {
    const normalizedRole = String(payload.role || "").toLowerCase();

    if (!ALLOWED_FRONTEND_ROLES.includes(normalizedRole)) {
      throw new Error("Role must be admin, analyst, or viewer.");
    }

    result.role = mapFrontendRoleToBackend(normalizedRole);
  }

  if (payload.status !== undefined) {
    const status = String(payload.status || "").toLowerCase();

    if (!ALLOWED_STATUSES.includes(status)) {
      throw new Error("Status must be active or inactive.");
    }

    result.status = status;
  } else if (payload.isActive !== undefined) {
    result.isActive = Boolean(payload.isActive);
  }

  if (!Object.keys(result).length) {
    throw new Error("At least one user field is required.");
  }

  return result;
}

function validateUserId(userId) {
  const normalizedUserId = String(userId || "").trim();

  if (!MONGODB_ID_PATTERN.test(normalizedUserId)) {
    throw new Error("User id must be a valid MongoDB ObjectId.");
  }

  return normalizedUserId;
}

/**
 * @param {UpdateAdminProfileRequest} payload
 * @returns {Promise<AuthUser | null>}
 */
export async function updateAdminProfile(payload) {
  assertAdminActor();

  const response = await apiClient.put(
    "/admin/profile",
    buildAdminProfilePayload(payload),
  );

  return extractUpdatedUser(response.data);
}

/**
 * @param {string} userId
 * @param {UpdateUserByAdminRequest} payload
 * @returns {Promise<AuthUser | null>}
 */
export async function updateUserByAdmin(userId, payload) {
  assertAdminActor();

  const response = await apiClient.put(
    `/admin/user/${validateUserId(userId)}`,
    buildAdminUserPayload(payload),
  );

  return extractUpdatedUser(response.data);
}

/**
 * @param {unknown} user
 * @returns {AuthUser | null}
 */
export function mapUserFromBackend(user) {
  return normalizeUser(user);
}

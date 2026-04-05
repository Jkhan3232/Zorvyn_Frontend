import { apiClient } from "../api/client.js";
import { normalizeUsersResponse, unwrapApiData } from "../lib/http.js";
import { mapUserFromBackend, updateUserByAdmin } from "./adminService.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CREATE_USER_ROLES = ["viewer", "analyst"];

function validateCreateUserPayload(payload = {}) {
  const name = String(payload?.name || "").trim();
  const email = String(payload?.email || "")
    .trim()
    .toLowerCase();
  const role = String(payload?.role || "")
    .trim()
    .toLowerCase();
  const password = String(payload?.password || "");
  const result = {
    name,
    email,
  };

  if (!name) {
    throw new Error("Name is required.");
  }

  if (!email) {
    throw new Error("Email is required.");
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw new Error("Please enter a valid email address.");
  }

  if (role) {
    if (!CREATE_USER_ROLES.includes(role)) {
      throw new Error("Role must be viewer or analyst.");
    }

    result.role = role;
  }

  if (payload?.isActive !== undefined) {
    result.isActive = Boolean(payload.isActive);
  }

  if (password) {
    if (password.length < 6 || password.length > 50) {
      throw new Error("Password must be between 6 and 50 characters.");
    }

    result.password = password;
  }

  return result;
}

export async function fetchUsers() {
  const response = await apiClient.get("/users");
  const users = normalizeUsersResponse(response.data);

  return users
    .map((user) => mapUserFromBackend(user))
    .filter((user) => Boolean(user));
}

export async function updateUserRole(userId, role) {
  return updateUserByAdmin(userId, { role });
}

export async function updateUserStatus(userId, isActive) {
  return updateUserByAdmin(userId, { isActive });
}

export async function updateUserWithAdminPayload(userId, payload) {
  return updateUserByAdmin(userId, payload);
}

export async function createUserByAdmin(payload) {
  const response = await apiClient.post(
    "/users",
    validateCreateUserPayload(payload),
  );

  const responsePayload = response.data || {};
  const data = unwrapApiData(responsePayload);
  const user = mapUserFromBackend(data?.user || data);

  return {
    success: Boolean(responsePayload?.success),
    message: String(responsePayload?.message || "").trim(),
    user,
  };
}

import { apiClient } from "../api/client.js";
import { normalizeUsersResponse } from "../lib/http.js";
import { mapUserFromBackend, updateUserByAdmin } from "./adminService.js";

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

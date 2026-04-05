import { apiClient } from "../api/client.js";
import { normalizeUsersResponse, unwrapApiData } from "../lib/http.js";

export async function fetchUsers() {
  const response = await apiClient.get("/users");
  return normalizeUsersResponse(response.data);
}

export async function updateUserRole(userId, role) {
  const response = await apiClient.patch(`/users/${userId}/role`, { role });
  return unwrapApiData(response.data);
}

export async function updateUserStatus(userId, isActive) {
  const response = await apiClient.patch(`/users/${userId}/status`, {
    isActive,
  });
  return unwrapApiData(response.data);
}

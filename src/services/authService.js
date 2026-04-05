import { apiClient } from "../api/client.js";
import { unwrapApiData } from "../lib/http.js";

export async function registerUser(payload) {
  const response = await apiClient.post("/auth/register", payload);
  return unwrapApiData(response.data);
}

export async function loginUser(payload) {
  const response = await apiClient.post("/auth/login", payload);
  const data = unwrapApiData(response.data);

  return {
    token: data?.token || "",
    user: data?.user || null,
  };
}

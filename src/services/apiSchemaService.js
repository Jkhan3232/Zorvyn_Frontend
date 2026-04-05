import { publicApiClient } from "../api/client.js";

/** @typedef {import("../types/authAdminApi").OpenApiJson} OpenApiJson */

/** @returns {Promise<OpenApiJson>} */
export async function fetchOpenApiJson() {
  const response = await publicApiClient.get("/swagger.json", {
    requiresAuth: false,
  });

  return response.data;
}

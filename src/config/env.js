const DEFAULT_API_BASE_URL = "http://localhost:2000";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

export const REST_BASE_PATH = "/api";

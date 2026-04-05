const AUTH_STORAGE_KEY = "finance_dashboard_auth";

function getFallbackAuth() {
  return { token: "", accessToken: "", refreshToken: "", user: null };
}

function normalizeAuthPayload(payload = {}) {
  const accessToken = String(
    payload?.accessToken || payload?.token || "",
  ).trim();
  const refreshToken = String(payload?.refreshToken || "").trim();

  return {
    token: accessToken,
    accessToken,
    refreshToken,
    user: payload?.user || null,
  };
}

export function getStoredAuth() {
  if (typeof window === "undefined") {
    return getFallbackAuth();
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return getFallbackAuth();
  }

  try {
    const parsed = JSON.parse(raw);
    return normalizeAuthPayload(parsed);
  } catch {
    return getFallbackAuth();
  }
}

export function setStoredAuth(auth) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = normalizeAuthPayload(auth);

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
}

export function getStoredAccessToken() {
  return getStoredAuth().accessToken;
}

export function setStoredAccessToken(accessToken) {
  const currentAuth = getStoredAuth();
  setStoredAuth({
    ...currentAuth,
    accessToken,
    token: accessToken,
  });
}

export function clearStoredAccessToken() {
  setStoredAccessToken("");
}

export function getStoredRefreshToken() {
  return getStoredAuth().refreshToken;
}

export function setStoredRefreshToken(refreshToken) {
  const currentAuth = getStoredAuth();
  setStoredAuth({
    ...currentAuth,
    refreshToken,
  });
}

export function clearStoredRefreshToken() {
  setStoredRefreshToken("");
}

export function clearStoredTokens() {
  const currentAuth = getStoredAuth();
  setStoredAuth({
    ...currentAuth,
    token: "",
    accessToken: "",
    refreshToken: "",
  });
}

export function clearStoredAuth() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

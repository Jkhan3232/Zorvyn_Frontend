const AUTH_STORAGE_KEY = "finance_dashboard_auth";

function getFallbackAuth() {
  return { token: "", user: null };
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
    return {
      token: parsed?.token || "",
      user: parsed?.user || null,
    };
  } catch {
    return getFallbackAuth();
  }
}

export function setStoredAuth(auth) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = {
    token: auth?.token || "",
    user: auth?.user || null,
  };

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
}

export function clearStoredAuth() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clearStoredAuth,
  getStoredAuth,
  setStoredAuth,
} from "../lib/storage.js";
import {
  login as loginRequest,
  logout as logoutSession,
  registerUser,
} from "../services/authService.js";
import { AuthContext } from "./AuthContextValue.js";

function getInitialAuthState() {
  return getStoredAuth();
}

function normalizeRole(role) {
  if (typeof role !== "string") {
    return "viewer";
  }

  const normalizedRole = role.toLowerCase();
  return ["viewer", "analyst", "admin"].includes(normalizedRole)
    ? normalizedRole
    : "viewer";
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(getInitialAuthState);

  const clearAuthState = useCallback(() => {
    clearStoredAuth();
    setAuthState(getInitialAuthState());
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = String(getStoredAuth().refreshToken || "").trim();

    try {
      if (refreshToken) {
        await logoutSession(refreshToken);
      }
    } catch {
      // Local logout should still succeed even if revoke call fails.
    } finally {
      clearAuthState();
    }
  }, [clearAuthState]);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearAuthState();
    };

    const handleTokenRefreshed = (event) => {
      const nextAccessToken = String(event?.detail?.accessToken || "").trim();
      if (!nextAccessToken) {
        return;
      }

      setAuthState((prev) => {
        const nextAuthState = {
          ...prev,
          token: nextAccessToken,
          accessToken: nextAccessToken,
        };

        setStoredAuth(nextAuthState);
        return nextAuthState;
      });
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    window.addEventListener("auth:token-refreshed", handleTokenRefreshed);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
      window.removeEventListener("auth:token-refreshed", handleTokenRefreshed);
    };
  }, [clearAuthState]);

  const login = useCallback(async (email, password) => {
    const auth = await loginRequest({ email, password });

    if (!auth?.accessToken || !auth?.refreshToken || !auth?.user) {
      throw new Error("Invalid login response from server.");
    }

    setStoredAuth(auth);
    setAuthState(auth);
    return auth;
  }, []);

  const register = useCallback(async (payload) => {
    return registerUser(payload);
  }, []);

  const updateUser = useCallback((nextUser) => {
    if (!nextUser || typeof nextUser !== "object") {
      return;
    }

    setAuthState((prev) => {
      const nextAuthState = {
        ...prev,
        user: {
          ...(prev.user || {}),
          ...nextUser,
        },
      };

      setStoredAuth(nextAuthState);
      return nextAuthState;
    });
  }, []);

  const role = normalizeRole(authState.user?.role);

  const value = useMemo(
    () => ({
      token: authState.accessToken || authState.token,
      accessToken: authState.accessToken || authState.token,
      refreshToken: authState.refreshToken,
      user: authState.user,
      role,
      isAuthenticated: Boolean(
        (authState.accessToken || authState.token) && authState.user,
      ),
      isAdmin: role === "admin",
      canReadRecords: role === "analyst" || role === "admin",
      login,
      register,
      logout,
      updateUser,
    }),
    [authState, role, login, logout, register, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

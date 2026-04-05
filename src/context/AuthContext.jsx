import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clearStoredAuth,
  getStoredAuth,
  setStoredAuth,
} from "../lib/storage.js";
import { loginUser, registerUser } from "../services/authService.js";
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

  const logout = useCallback(() => {
    clearStoredAuth();
    setAuthState({ token: "", user: null });
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [logout]);

  const login = useCallback(async (email, password) => {
    const auth = await loginUser({ email, password });

    if (!auth?.token || !auth?.user) {
      throw new Error("Invalid login response from server.");
    }

    setStoredAuth(auth);
    setAuthState(auth);
    return auth;
  }, []);

  const register = useCallback(async (payload) => {
    return registerUser(payload);
  }, []);

  const role = normalizeRole(authState.user?.role);

  const value = useMemo(
    () => ({
      token: authState.token,
      user: authState.user,
      role,
      isAuthenticated: Boolean(authState.token && authState.user),
      isAdmin: role === "admin",
      canReadRecords: role === "analyst" || role === "admin",
      login,
      register,
      logout,
    }),
    [authState, role, login, logout, register],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

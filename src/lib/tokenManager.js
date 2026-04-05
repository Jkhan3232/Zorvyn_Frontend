import {
  clearStoredAccessToken,
  clearStoredRefreshToken,
  clearStoredTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredAccessToken,
  setStoredRefreshToken,
} from "./storage.js";

export function getAccessToken() {
  return getStoredAccessToken();
}

export function setAccessToken(accessToken) {
  setStoredAccessToken(accessToken);
}

export function clearAccessToken() {
  clearStoredAccessToken();
}

export function getRefreshToken() {
  return getStoredRefreshToken();
}

export function setRefreshToken(refreshToken) {
  setStoredRefreshToken(refreshToken);
}

export function clearRefreshToken() {
  clearStoredRefreshToken();
}

export function clearAllTokens() {
  clearStoredTokens();
}

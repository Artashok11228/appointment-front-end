/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useMessage } from "./MessageContext";
import {
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  setUnauthorizedHandler,
  toApiFailure,
} from "../shared/api";
import {
  login as loginRequest,
  register as registerRequest,
  logout as logoutRequest,
  me as meRequest,
} from "../features/auth/api";

const AuthContext = createContext();

const LEGACY_DOMAIN_KEYS = [
  "allUsers",
  "currentUser",
  "Appointments",
  "EleganceStaff",
  "FeedbackData",
];

function clearLegacyDomainStorage() {
  for (const key of LEGACY_DOMAIN_KEYS) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
}

function toAuthFailure(error) {
  const failure = toApiFailure(error, "Something went wrong");
  return {
    success: false,
    error: failure.message,
    errors: failure.errors,
    status: failure.status,
  };
}

function shouldRedirectOnUnauthorized() {
  const path = window.location.pathname;
  return path !== "/login" && path !== "/register";
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { showMessage } = useMessage();

  const clearSession = useCallback(() => {
    clearAuthToken();
    setCurrentUser(null);
    setIsAuthenticated(false);
  }, []);

  const applyAuthSuccess = useCallback((user, token, rememberMe) => {
    setAuthToken(token, rememberMe ? "local" : "session");
    setCurrentUser(user);
    setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    clearLegacyDomainStorage();

    setUnauthorizedHandler(() => {
      setCurrentUser(null);
      setIsAuthenticated(false);
      if (shouldRedirectOnUnauthorized()) {
        window.location.assign("/login");
      }
    });

    let cancelled = false;

    async function bootstrap() {
      const token = getAuthToken();
      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const user = await meRequest();
        if (cancelled) return;
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch {
        if (cancelled) return;
        clearSession();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
      setUnauthorizedHandler(null);
    };
  }, [clearSession]);

  const register = async (userData) => {
    try {
      const body = {
        name: userData.name.trim(),
        email: userData.email.toLowerCase().trim(),
        password: userData.password,
        password_confirmation: userData.password_confirmation,
      };

      const { data: user, token } = await registerRequest(body);
      applyAuthSuccess(user, token, Boolean(userData.rememberMe));

      if (typeof showMessage === "function") {
        showMessage("success", "Account created successfully");
      }
      return { success: true, user };
    } catch (error) {
      return toAuthFailure(error);
    }
  };

  const login = async (userData) => {
    try {
      const body = {
        email: userData.email.toLowerCase().trim(),
        password: userData.password,
      };

      const { data: user, token } = await loginRequest(body);
      applyAuthSuccess(user, token, Boolean(userData.rememberMe));

      if (typeof showMessage === "function") {
        showMessage("success", "Logged in successfully");
      }
      return { success: true, user };
    } catch (error) {
      return toAuthFailure(error);
    }
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch {
      // Still clear local session if the network/API call fails.
    } finally {
      clearSession();
      if (typeof showMessage === "function") {
        showMessage("success", "Logged out successfully");
      }
    }
  };

  const value = {
    currentUser,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

import React, { useState, createContext, useEffect } from "react";
import {
  AUTH_TIMESTAMP,
  AUTH_TOKEN,
  AUTH_USER,
  USER_PROMPT_INPUT_MAP,
} from "@/utils/constants";
import System from "./models/system";
import { useNavigate } from "react-router-dom";
import { safeJsonParse } from "@/utils/request";

export const AuthContext = createContext(null);
export function AuthProvider(props) {
  const localUser = localStorage.getItem(AUTH_USER);
  const localAuthToken = localStorage.getItem(AUTH_TOKEN);
  const [store, setStore] = useState({
    user: localUser ? safeJsonParse(localUser, null) : null,
    authToken: localAuthToken ? localAuthToken : null,
  });

  const navigate = useNavigate();

  const [actions] = useState({
    updateUser: (user, authToken = "") => {
      localStorage.setItem(AUTH_USER, JSON.stringify(user));
      localStorage.setItem(AUTH_TOKEN, authToken);
      setStore({ user, authToken });
    },
    unsetUser: () => {
      localStorage.removeItem(AUTH_USER);
      localStorage.removeItem(AUTH_TOKEN);
      localStorage.removeItem(AUTH_TIMESTAMP);
      localStorage.removeItem(USER_PROMPT_INPUT_MAP);
      setStore({ user: null, authToken: null });
    },
  });

  // OAuth callbacks return the short-lived session token in the URL fragment.
  // Fragments are not sent as HTTP requests, so the token does not leak through
  // the query string or Referer header. Consume it once and immediately clean
  // the address bar.
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;

    const params = new URLSearchParams(hash);
    const oauthToken = params.get("oauth_token");
    const oauthError = params.get("oauth_error");

    if (oauthToken) {
      localStorage.setItem(AUTH_TOKEN, oauthToken);
      localStorage.removeItem(AUTH_TIMESTAMP);
      setStore((prev) => ({ ...prev, authToken: oauthToken }));
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      return;
    }

    if (oauthError) {
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      console.error("OAuth login failed:", oauthError);
    }
  }, []);

  useEffect(() => {
    async function refreshUser() {
      const { success, user: refreshedUser } = await System.refreshUser();
      if (success && refreshedUser === null) return;

      if (!success) {
        localStorage.removeItem(AUTH_USER);
        localStorage.removeItem(AUTH_TOKEN);
        localStorage.removeItem(AUTH_TIMESTAMP);
        localStorage.removeItem(USER_PROMPT_INPUT_MAP);
        setStore({ user: null, authToken: null });
        navigate("/login");
        return;
      }

      localStorage.setItem(AUTH_USER, JSON.stringify(refreshedUser));
      setStore((prev) => ({
        ...prev,
        user: refreshedUser,
      }));
    }
    if (store.authToken) refreshUser();
  }, [store.authToken]);

  return (
    <AuthContext.Provider value={{ store, actions }}>
      {props.children}
    </AuthContext.Provider>
  );
}

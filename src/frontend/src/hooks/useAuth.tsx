import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useActor } from "@/hooks/useActor";

import type { AuthError, User } from "@/backend";

const TOKEN_KEY = "arteriq-session-token";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoggingIn: boolean;
  isLoginSuccess: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toAuthUser(user: User): AuthUser {
  return { id: user.id.toString(), name: user.name, email: user.email };
}

function authErrorMessage(err: AuthError): string {
  switch (err) {
    case "invalidEmail":
      return "Please enter a valid email address.";
    case "emailTaken":
      return "An account with this email already exists. Try signing in instead.";
    case "weakPassword":
      return "Please choose a stronger password (at least 8 characters).";
    case "invalidCredentials":
      return "Incorrect email or password. Please try again.";
    case "notAuthenticated":
      return "Your session has expired. Please sign in again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

/**
 * Email + password authentication provider.
 *
 * ArteriQ uses a simple email + password account system backed by the
 * platform's real database (no Internet Identity, no social login). A session
 * token returned by the backend is stored in localStorage so the user stays
 * logged in across reloads; on load the token is validated against
 * `getCurrentUser` to restore the session.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { actor, isFetching } = useActor();
  const [token, setToken] = useState<string | null>(() =>
    typeof window === "undefined"
      ? null
      : window.localStorage.getItem(TOKEN_KEY),
  );
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore a persisted session once the actor is ready.
  useEffect(() => {
    if (isFetching) return;
    const stored = window.localStorage.getItem(TOKEN_KEY);
    if (!stored || !actor) {
      setIsInitializing(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const current = await actor.getCurrentUser(stored);
        if (cancelled) return;
        if (current) {
          setToken(stored);
          setUser(toAuthUser(current));
        } else {
          window.localStorage.removeItem(TOKEN_KEY);
          setToken(null);
        }
      } catch {
        if (!cancelled) {
          window.localStorage.removeItem(TOKEN_KEY);
          setToken(null);
        }
      } finally {
        if (!cancelled) setIsInitializing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [actor, isFetching]);

  const login = useCallback(
    async (email: string, password: string) => {
      if (!actor) throw new Error("Backend is not ready");
      setIsLoggingIn(true);
      setError(null);
      try {
        const result = await actor.login(email, password);
        if (result.__kind__ === "err") {
          setError(authErrorMessage(result.err));
          return;
        }
        const newToken = result.ok;
        window.localStorage.setItem(TOKEN_KEY, newToken);
        setToken(newToken);
        const current = await actor.getCurrentUser(newToken);
        if (current) {
          setUser(toAuthUser(current));
          setIsLoginSuccess(true);
        }
      } catch {
        setError("Unable to reach the server. Please try again.");
      } finally {
        setIsLoggingIn(false);
      }
    },
    [actor],
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      if (!actor) throw new Error("Backend is not ready");
      setIsLoggingIn(true);
      setError(null);
      try {
        const result = await actor.signup(name, email, password);
        if (result.__kind__ === "err") {
          setError(authErrorMessage(result.err));
          return;
        }
        // Sign-up returns the new user; obtain a session token by signing in.
        const loginResult = await actor.login(email, password);
        if (loginResult.__kind__ === "err") {
          setError(authErrorMessage(loginResult.err));
          return;
        }
        const newToken = loginResult.ok;
        window.localStorage.setItem(TOKEN_KEY, newToken);
        setToken(newToken);
        setUser(toAuthUser(result.ok));
        setIsLoginSuccess(true);
      } catch {
        setError("Unable to reach the server. Please try again.");
      } finally {
        setIsLoggingIn(false);
      }
    },
    [actor],
  );

  const logout = useCallback(async () => {
    if (actor && token) {
      try {
        await actor.logout(token);
      } catch {
        // Ignore network errors on logout — clear the local session regardless.
      }
    }
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setIsLoginSuccess(false);
  }, [actor, token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: !!user && !!token,
      isInitializing,
      isLoggingIn,
      isLoginSuccess,
      error,
      login,
      signup,
      logout,
    }),
    [
      user,
      token,
      isInitializing,
      isLoggingIn,
      isLoginSuccess,
      error,
      login,
      signup,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Tolerate rendering outside an AuthProvider (e.g. isolated component
    // tests) by returning a safe, unauthenticated default rather than
    // throwing. Production always wraps the tree in AuthProvider.
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      isInitializing: false,
      isLoggingIn: false,
      isLoginSuccess: false,
      error: null,
      login: async () => {},
      signup: async () => {},
      logout: async () => {},
    };
  }
  return ctx;
}

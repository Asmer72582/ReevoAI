import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import { authApi, getStoredToken, setStoredToken, type SessionUser } from "./api-client";

type AuthContextValue = {
  user: SessionUser | null;
  loading: boolean;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const idleAuth: AuthContextValue = {
  user: null,
  loading: false,
  ready: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refresh: async () => {},
};

const AuthContext = createContext<AuthContextValue>(idleAuth);

function AuthProviderInner({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      return;
    }
    setLoading(true);
    try {
      const { user: u } = await authApi.me();
      setUser(u);
    } catch {
      setStoredToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = getStoredToken();
      if (!token) {
        if (!cancelled) {
          setUser(null);
          setReady(true);
        }
        return;
      }
      setLoading(true);
      try {
        const { user: u } = await authApi.me();
        if (!cancelled) setUser(u);
      } catch {
        if (!cancelled) {
          setStoredToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: u, token } = await authApi.login(email, password);
    setStoredToken(token);
    setUser(u);
    setReady(true);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const { user: u, token } = await authApi.register(email, password, name);
    setStoredToken(token);
    setUser(u);
    setReady(true);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setStoredToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, ready, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Auth runs only in the browser — avoids SSR hydration issues and stray /api calls during SSR. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <AuthContext.Provider value={idleAuth}>{children}</AuthContext.Provider>;
  }

  return <AuthProviderInner>{children}</AuthProviderInner>;
}

export function useAuth() {
  return useContext(AuthContext);
}

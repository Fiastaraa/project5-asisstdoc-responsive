import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';
import type { User } from '../types/auth';
interface Ctx { user: User | null; token: string | null; isAuthenticated: boolean; isHydrating: boolean; login: (token: string, user: User) => Promise<void>; logout: () => Promise<void>; }
const AuthContext = createContext<Ctx | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); const [token, setToken] = useState<string | null>(null); const [isHydrating, setHydrating] = useState(true);
  const logout = useCallback(async () => { await SecureStore.deleteItemAsync('assistdoc_token'); await SecureStore.deleteItemAsync('assistdoc_user'); setToken(null); setUser(null); }, []);
  const login = useCallback(async (t: string, u: User) => { await SecureStore.setItemAsync('assistdoc_token', t); await SecureStore.setItemAsync('assistdoc_user', JSON.stringify(u)); setToken(t); setUser(u); }, []);
  useEffect(() => { let active = true; (async () => { try { const t = await SecureStore.getItemAsync('assistdoc_token'); const raw = await SecureStore.getItemAsync('assistdoc_user'); if (!t) return; if (active) { setToken(t); if (raw) setUser(JSON.parse(raw)); } try { const r = await api.get('/auth/me'); const u = r.data?.data?.user; if (active && u) { setUser(u); await SecureStore.setItemAsync('assistdoc_user', JSON.stringify(u)); } } catch { if (active) await logout(); } } catch { if (active) await logout(); } finally { if (active) setHydrating(false); } })(); return () => { active = false; }; }, [logout]);
  return <AuthContext.Provider value={useMemo(() => ({ user, token, isAuthenticated: !!(token && user), isHydrating, login, logout }), [user, token, isHydrating, login, logout])}>{children}</AuthContext.Provider>;
}
export function useAuth() { const v = useContext(AuthContext); if (!v) throw new Error('useAuth must be used inside AuthProvider'); return v; }

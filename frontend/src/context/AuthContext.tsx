import React, { createContext, useContext, useState, useCallback } from 'react';

export interface AuthUser {
  email: string;
  token: string;
  permisos: string[];   // e.g. ['activos.ver', 'activos.crear']
  esAdmin: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (token: string, email: string, permisos?: string[], esAdmin?: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail') || '';
    const permisos = JSON.parse(localStorage.getItem('permisos') || '[]');
    const esAdmin = localStorage.getItem('esAdmin') === 'true';
    if (token) return { token, email, permisos, esAdmin };
    return null;
  });

  const login = useCallback((token: string, email: string, permisos: string[] = [], esAdmin = false) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('permisos', JSON.stringify(permisos));
    localStorage.setItem('esAdmin', String(esAdmin));
    setUser({ token, email, permisos, esAdmin });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('permisos');
    localStorage.removeItem('esAdmin');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;

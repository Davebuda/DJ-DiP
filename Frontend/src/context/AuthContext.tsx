import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN, REGISTER } from '../graphql/queries';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  profilePictureUrl?: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDJ: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  updateUserLocal: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginMutation] = useMutation(LOGIN);
  const [registerMutation] = useMutation(REGISTER);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('accessToken');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedToken) {
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const persistSession = (accessToken: string, refreshToken: string, account: User) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(account));
    setToken(accessToken);
    setUser(account);
  };

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await loginMutation({ variables: { email, password } });
      if (data?.login) {
        const { accessToken, refreshToken, user: account } = data.login;
        persistSession(accessToken, refreshToken, account);
      }
    },
    [loginMutation],
  );

  const register = useCallback(
    async (email: string, password: string, fullName: string) => {
      const { data } = await registerMutation({
        variables: { email, password, fullName },
      });
      if (data?.register) {
        const { accessToken, refreshToken, user: account } = data.register;
        persistSession(accessToken, refreshToken, account);
      }
    },
    [registerMutation],
  );

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  }, []);

  // Update local user state + localStorage without re-authenticating
  const updateUserLocal = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      updateUserLocal,
      isAuthenticated: Boolean(user),
      isAdmin:
        !!user &&
        (user.role === 'Admin' || user.email?.toLowerCase() === '2djdip@gmail.com'),
      isDJ: !!user && user.role === 'DJ',
    }),
    [user, token, loading, login, register, logout, updateUserLocal],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
};

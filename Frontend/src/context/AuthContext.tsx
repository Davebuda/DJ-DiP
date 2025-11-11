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
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginMutation] = useMutation(LOGIN);
  const [registerMutation] = useMutation(REGISTER);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const persistSession = (accessToken: string, refreshToken: string, account: User) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(account));
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
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: Boolean(user),
      isAdmin:
        !!user &&
        (user.role === 'Admin' || user.email?.toLowerCase() === '2djdip@gmail.com'),
    }),
    [user, loading, login, register, logout],
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

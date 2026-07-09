import { createContext, useState, useContext, useEffect, useCallback } from "react";
import * as authService from "../services/authService";

const defaultContextValue = {
  user: null,
  login: async () => {
    throw new Error("AuthContext não foi inicializado. Certifique-se de que o componente está dentro de um AuthProvider.");
  },
  logout: () => {
    throw new Error("AuthContext não foi inicializado. Certifique-se de que o componente está dentro de um AuthProvider.");
  },
  loading: true,
  signed: false,
  sessionDegraded: false,
};

const AuthContext = createContext(defaultContextValue);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionDegraded, setSessionDegraded] = useState(false);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setSessionDegraded(false);
  }, []);

  useEffect(() => {
    authService.setSessionUpdateHandler((userData) => {
      setUser(userData);
      setSessionDegraded(false);
    });
    return () => authService.setSessionUpdateHandler(null);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      const token = authService.getToken();
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setSessionDegraded(false);
        } catch (error) {
          console.error("Erro ao carregar usuário:", error);
          const status = error?.response?.status;
          const isNetwork =
            !error?.response &&
            (error?.code === 'ECONNREFUSED' ||
              error?.code === 'ETIMEDOUT' ||
              error?.code === 'ERR_NETWORK');

          if (isNetwork) {
            const cached = authService.getUser();
            if (cached) {
              setUser(cached);
              setSessionDegraded(true);
            } else {
              logout();
            }
          } else if (status >= 500) {
            const cached = authService.getUser();
            if (cached) {
              setUser(cached);
              setSessionDegraded(true);
            } else {
              logout();
            }
          } else if (
            status === 401 ||
            status === 403 ||
            status === 404 ||
            (error?.message ?? '').includes('Acesso negado')
          ) {
            logout();
          } else {
            logout();
          }
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [logout]);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === authService.ACCESS_TOKEN_KEY && !event.newValue) {
        logout();
      }
      if (event.key === authService.REFRESH_TOKEN_KEY && !event.newValue) {
        logout();
      }
      if (event.key === authService.USER_KEY && event.newValue) {
        try {
          setUser(JSON.parse(event.newValue));
          setSessionDegraded(false);
        } catch {
          // ignore parse errors
        }
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [logout]);

  const login = async (email, password) => {
    try {
      const { user: loggedUser } = await authService.loginUser(email, password);
      setUser(loggedUser);
      setSessionDegraded(false);
      return true;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      throw error;
    }
  };

  const contextValue = {
    user,
    login,
    logout,
    loading,
    signed: !!user,
    sessionDegraded,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context || typeof context.login !== 'function') {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider. O contexto não foi inicializado corretamente.");
  }

  return context;
};

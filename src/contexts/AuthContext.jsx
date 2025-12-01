import { createContext, useState, useContext, useEffect } from "react";
import * as authService from "../services/authService";
import api from "../services/api";

// Valor padrão do contexto
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
};

// Cria o contexto de autenticação
const AuthContext = createContext(defaultContextValue);

// Provider que envolve a aplicação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se há um token salvo ao carregar a aplicação
    const loadUser = async () => {
      const token = authService.getToken();
      if (token) {
        try {
          // Busca os dados do usuário da API
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error("Erro ao carregar usuário:", error);
          // Se der erro, limpa o token inválido
          authService.logout();
        }
      }
      setLoading(false);
    };
    
    loadUser();
  }, []);

  // Função de login
  const login = async (email, password) => {
    try {
      // Chama a API de login
      const { user, accessToken, refreshToken } = await authService.loginUser(email, password);
      
      // Salva o usuário no estado
      setUser(user);

      return true;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      throw error;
    }
  };

  // Função de logout
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const contextValue = {
    user,
    login,
    logout,
    loading,
    signed: !!user,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // Verificação adicional de segurança
  if (!context || typeof context.login !== 'function') {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider. O contexto não foi inicializado corretamente.");
  }
  
  return context;
};


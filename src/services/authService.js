// Gerenciamento de autenticação e tokens JWT
import api from './api';

export const ACCESS_TOKEN_KEY = "@autswot-admin-access-token";
export const REFRESH_TOKEN_KEY = "@autswot-admin-refresh-token";
export const USER_KEY = "@autswot-admin-user";

// Verifica se há um token no localStorage (usuário logado)
export const isAuthenticated = () => localStorage.getItem(ACCESS_TOKEN_KEY) !== null;

// Pega o access token do localStorage
export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

// Pega o refresh token do localStorage
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

// Pega o usuário do localStorage
export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

// Salva os tokens e dados do usuário (login)
export const saveAuth = (accessToken, refreshToken, user) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Remove os tokens e dados do usuário (logout)
export const logout = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Retrocompatibilidade: ainda suporta TOKEN_KEY antigo
export const TOKEN_KEY = ACCESS_TOKEN_KEY;
export const getToken = getAccessToken;

// ============================================
// FUNÇÕES DE API
// ============================================

/**
 * Faz login do usuário
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<{user: Object, token: string}>}
 */
export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { user, accessToken, refreshToken } = response.data;
    
    // Debug: log do role recebido
    
    // Verificar se o usuário tem permissão de super user
    // Normalizar o role para garantir comparação correta
    const userRole = user.role?.toString().trim().toUpperCase();
    if (userRole !== 'SUPER_USER') {
      throw new Error('Acesso negado. Apenas super usuários podem acessar o painel administrativo.');
    }
    
    // Salvar tokens e dados do usuário
    saveAuth(accessToken, refreshToken, user);
    
    return response.data;
  } catch (error) {
    console.error('Erro no login:', error);
    
    if (error.response) {
      // Erro da API
      const errorMsg = error.response.data?.error || error.response.data?.message || 'Erro ao fazer login';
      throw new Error(errorMsg);
    } else if (error.code === 'ECONNREFUSED') {
      throw new Error('Não foi possível conectar à API. Verifique se o servidor está acessível');
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error('A requisição demorou muito. Verifique sua conexão com a internet.');
    } else if (error.request) {
      // Erro de rede
      throw new Error('Erro de conexão. Verifique sua conexão com a internet');
    } else {
      // Outro erro (incluindo erro de permissão)
      throw new Error(error.message || 'Erro ao fazer login');
    }
  }
};

/**
 * Busca dados do usuário atual
 * @returns {Promise<Object>}
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    const { user } = response.data;
    
    // Debug: log do role recebido
    
    // Verificar se o usuário ainda tem permissão de super user
    // Normalizar o role para garantir comparação correta
    const userRole = user.role?.toString().trim().toUpperCase();
    if (userRole !== 'SUPER_USER') {
      logout();
      throw new Error('Acesso negado. Apenas super usuários podem acessar o painel administrativo.');
    }
    
    // Atualizar dados do usuário no localStorage
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    return user;
  } catch (error) {
    // Se o token for inválido, fazer logout
    if (error.response && error.response.status === 401) {
      logout();
    }
    throw error;
  }
};


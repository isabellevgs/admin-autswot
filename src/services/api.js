// Configuração do Axios com interceptors para autenticação

import axios from "axios";
import { 
  getAccessToken, 
  getRefreshToken, 
  saveAuth, 
  logout,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY 
} from "./authService";

// Verificar se estamos em desenvolvimento e API está acessível
if (import.meta.env.DEV) {
  console.log('🔧 Modo desenvolvimento');
  console.log('📍 API configurada para: http://localhost:3000');
}

// Cria uma instância do Axios
const api = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: adiciona o access token JWT em todas as requisições
api.interceptors.request.use(
  async (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor: renovar token automaticamente quando expirar
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log detalhado do erro
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Conexão recusada:', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        message: 'Verifique se a API está rodando em http://localhost:3000',
      });
    } else if (error.code === 'ETIMEDOUT') {
      console.error('⏱️ Timeout:', {
        url: error.config?.url,
        message: 'A requisição demorou muito para responder',
      });
    } else if (error.response) {
      // Erro com resposta (status code)
      console.error('❌ Erro da API:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
    } else if (error.request) {
      // Erro sem resposta (rede)
      console.error('🌐 Erro de rede:', {
        message: 'Não foi possível conectar à API',
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      });
    }

    // Se receber 401 e ainda não tentou renovar
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        
        if (!refreshToken) {
          // Não tem refresh token, fazer logout
          logout();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Tentar renovar o access token
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh-token`,
          { refreshToken }
        );

        // Salvar novo access token
        localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);

        // Atualizar header da requisição original
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        // Tentar novamente a requisição original
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token inválido ou expirado, fazer logout
        logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;


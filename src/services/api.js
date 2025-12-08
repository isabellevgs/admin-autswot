// Configuração do Axios com interceptors para autenticação

import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  logout,
  ACCESS_TOKEN_KEY,
} from "./authService";

// Configuração do ambiente
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000;
const IS_DEV = import.meta.env.DEV;

// Log de configuração (apenas em desenvolvimento)
if (IS_DEV) {
  console.log(`API: ${API_URL}`);
}

// Cria uma instância do Axios
const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
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
  (error) => Promise.reject(error)
);

// Interceptor: renovar token automaticamente quando expirar
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Log de erros (apenas em desenvolvimento)
    if (IS_DEV) {
      if (error.code === "ECONNREFUSED") {
        console.error(`Conexão recusada: ${API_URL}`);
      } else if (error.code === "ETIMEDOUT") {
        console.error(`Timeout na requisição: ${error.config?.url}`);
      } else if (error.response) {
        console.error(
          `API Error [${error.response.status}]:`,
          error.response.data
        );
      } else if (error.request) {
        console.error("Erro de rede: não foi possível conectar à API");
      }
    }

    // Se receber 401 e ainda não tentou renovar
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();

        if (!refreshToken) {
          logout();
          window.location.href = "/login";
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
        logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

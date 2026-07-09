// Configuração do Axios com interceptors para autenticação

import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  logout,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from "./authService";
import { isAuthCredentialEndpoint, shouldAttemptTokenRefresh } from "@/utils/api-interceptors";

/** URL da API — em produção usa sempre /api (same-origin via nginx). */
function resolveApiBaseUrl() {
  const configured = (import.meta.env.VITE_API_URL ?? "").trim();

  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;
    if (protocol === "https:" && hostname.endsWith("autswot.com")) {
      return "/api";
    }
  }

  if (configured.startsWith("http://") || configured.startsWith("https://")) {
    return "/api";
  }

  return configured || "/api";
}

const API_URL = resolveApiBaseUrl();
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000;
const IS_DEV = import.meta.env.DEV;

if (IS_DEV) {
  console.log(`API: ${API_URL}`);
}

const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise = null;

async function renovarAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error("Refresh token ausente");
    }

    const { data } = await axios.post(
      `${api.defaults.baseURL}/auth/refresh-token`,
      { refreshToken }
    );

    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    }

    const { syncSessionFromApi } = await import("./authService.js");
    await syncSessionFromApi();

    return data.accessToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

function isErroDeRede(err) {
  if (err?.response) return false
  const code = err?.code
  return code === 'ECONNREFUSED' || code === 'ETIMEDOUT' || code === 'ERR_NETWORK'
}

async function tratarAcessoNegado() {
  const { syncSessionFromApi, logout } = await import("./authService.js");
  try {
    const user = await syncSessionFromApi();
    const role = user?.role?.toString().trim().toUpperCase();
    if (role !== 'SUPER_USER') {
      logout();
      window.location.href = "/login";
    }
    return;
  } catch (err) {
    if (isErroDeRede(err)) {
      return;
    }

    const status = err?.response?.status;
    const acessoRevogado =
      status === 401 ||
      status === 403 ||
      (err?.message ?? '').includes('Acesso negado');

    if (acessoRevogado) {
      logout();
      window.location.href = "/login";
    }
  }
}

api.interceptors.request.use(
  async (config) => {
    if (isAuthCredentialEndpoint(config.url, config.baseURL ?? api.defaults.baseURL)) {
      delete config.headers.Authorization;
      return config;
    }

    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

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

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      await tratarAcessoNegado();
      return Promise.reject(error);
    }

    if (shouldAttemptTokenRefresh(error, originalRequest, getAccessToken)) {
      originalRequest._retry = true;

      try {
        const accessToken = await renovarAccessToken();
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        const novoAccess = getAccessToken();
        const tokenAnterior = originalRequest.headers?.Authorization?.replace(/^Bearer\s+/i, '');
        if (novoAccess && novoAccess !== tokenAnterior && !originalRequest._storageRetry) {
          originalRequest._storageRetry = true;
          originalRequest.headers.Authorization = `Bearer ${novoAccess}`;
          return api(originalRequest);
        }
        logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

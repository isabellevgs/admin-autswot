/**
 * Helpers compartilhados para interceptors axios de autenticação.
 */

export function isAuthCredentialEndpoint(url, baseURL = '') {
  if (!url) return false
  const path = String(url).replace(baseURL, '')
  return /\/auth\/(login|register|refresh-token)(\/|$|\?)/.test(path)
}

export function shouldAttemptTokenRefresh(error, originalRequest, getAccessToken) {
  if (error?.response?.status !== 401) return false
  if (!originalRequest || originalRequest._retry) return false
  if (isAuthCredentialEndpoint(originalRequest.url, originalRequest.baseURL)) return false

  const hadAuth =
    originalRequest.headers?.Authorization ||
    (typeof getAccessToken === 'function' && getAccessToken())

  return Boolean(hadAuth)
}

/**
 * Retorna URL segura para uso em src/backgroundImage (apenas http/https).
 */
export function safeImageUrl(url) {
  if (!url || typeof url !== 'string') return null
  try {
    const parsed = new URL(url.trim())
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href
    }
  } catch {
    return null
  }
  return null
}

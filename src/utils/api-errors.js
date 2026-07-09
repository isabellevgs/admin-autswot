export function extrairErroApi(err, fallback = 'Ocorreu um erro. Tente novamente.') {
  const data = err?.response?.data
  if (data?.details && Array.isArray(data.details)) {
    return data.details.map((d) => d.message || d).join(', ')
  }
  return data?.error || data?.message || err?.message || fallback
}

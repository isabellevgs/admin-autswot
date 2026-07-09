import api from '@/services/api'

/**
 * Busca todas as páginas de um endpoint paginado.
 * @param {string} url
 * @param {{ itemsKey?: string, limit?: number, params?: object }} options
 */
export async function fetchAllPages(url, { itemsKey = 'users', limit = 100, params = {} } = {}) {
  const all = []
  let page = 1
  let totalPages = 1

  do {
    const response = await api.get(url, {
      params: { ...params, page: String(page), limit: String(limit) },
    })

    const items = response.data?.[itemsKey] ?? response.data?.registros ?? response.data?.posts ?? []
    all.push(...items)

    totalPages = response.data?.pagination?.totalPages ?? 1
    page += 1
  } while (page <= totalPages)

  return all
}

/**
 * Soma pagination.total dos endpoints de questionário (SH, CH, FO, F).
 * HS não entra no cálculo — não há respostas de questionário para histórias sociais.
 */
export async function fetchTotalPerguntas() {
  const endpoints = [
    '/fraquezas-ameacas-sh',
    '/fraquezas-ameacas-ch',
    '/fraquezas-oportunidades',
    '/forcas',
  ]

  try {
    const results = await Promise.allSettled(
      endpoints.map(async (endpoint) => {
        const res = await api.get(endpoint, { params: { page: 1, limit: 1 } })
        return res.data?.pagination?.total ?? 0
      }),
    )

    const failed = results.filter((r) => r.status === 'rejected')
    if (failed.length > 0) {
      console.warn('fetchTotalPerguntas: alguns endpoints falharam', failed)
      return null
    }
    const totals = results.map((r) => (r.status === 'fulfilled' ? r.value : 0))
    const total = totals.reduce((acc, n) => acc + n, 0)
    return total > 0 ? total : null
  } catch (err) {
    console.warn('fetchTotalPerguntas: erro inesperado', err)
    return null
  }
}

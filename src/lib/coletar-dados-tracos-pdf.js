import api from '@/services/api'

const SWOT_ORDEM = ['ameacas', 'fraquezas', 'oportunidades', 'forcas']

async function fetchDetalhe(tipo, numeroTraco) {
  if (tipo === 'SH') return api.get(`/relatorio-sh/${numeroTraco}`).catch(() => null)
  if (tipo === 'CH') return api.get(`/relatorio-ch/${numeroTraco}`).catch(() => null)
  return api.get(`/traco-detalhe/${tipo}/${numeroTraco}`).catch(() => null)
}

/**
 * @param {object} dadosSwot — items com tipo, numeroTraco, quadrante, label
 * @param {string} userId — ID do usuário (admin)
 */
export async function coletarDadosTracosParaPdf(dadosSwot, userId) {
  const reflexoesRes = await api
    .get(`/reflexao-traco/user/${userId}`)
    .catch(() => ({ data: [] }))

  const mapaReflexoes = new Map(
    reflexoesRes.data.map((r) => [
      `${r.tipo}-${r.numeroTraco}-${r.quadrante}`,
      r.respostas ?? {},
    ]),
  )

  const tracos = []

  for (const secaoKey of SWOT_ORDEM) {
    for (const item of dadosSwot[secaoKey]?.items ?? []) {
      const { tipo, numeroTraco, quadrante, label } = item
      const resDetalhe = await fetchDetalhe(tipo, numeroTraco)
      const key = `${tipo}-${numeroTraco}-${quadrante}`

      tracos.push({
        label: label ?? resDetalhe?.data?.titulo ?? `Traço ${numeroTraco}`,
        tipo,
        numeroTraco,
        quadrante,
        detalhe: resDetalhe?.data ?? null,
        respostas: mapaReflexoes.get(key) ?? {},
      })
    }
  }

  return tracos
}

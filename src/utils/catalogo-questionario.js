import api from '@/services/api'
import { fetchAllPages } from '@/utils/fetch-all-pages'

function historiaExigeIntensidade(historia) {
  if (!historia) return false
  return !!(
    historia.perguntaIntensidade?.trim() ||
    historia.intensidadeLeve?.trim() ||
    historia.intensidadeModerada?.trim() ||
    historia.intensidadeAlta?.trim()
  )
}

/**
 * Carrega metadados do catálogo para cálculo de progresso alinhado ao app/API.
 */
export async function fetchCatalogoQuestionario() {
  const [sh, ch, fo, f, historias] = await Promise.all([
    fetchAllPages('/fraquezas-ameacas-sh', { itemsKey: 'registros', limit: 100 }),
    fetchAllPages('/fraquezas-ameacas-ch', { itemsKey: 'registros', limit: 100 }),
    fetchAllPages('/fraquezas-oportunidades', { itemsKey: 'registros', limit: 100 }),
    fetchAllPages('/forcas', { itemsKey: 'registros', limit: 100 }),
    fetchAllPages('/historias-sociais', { itemsKey: 'registros', limit: 100 }),
  ])

  const historiasPorNumero = new Map(historias.map((h) => [h.numeroHistoria, h]))

  const chIntensidadePorPerguntaId = new Map()
  let totalRespondiveis = sh.length + fo.length + f.length

  ch.forEach((registro) => {
    const historia = historiasPorNumero.get(registro.numHistoria)
    if (historia) {
      totalRespondiveis += 1
      if (historiaExigeIntensidade(historia)) {
        chIntensidadePorPerguntaId.set(registro.id, true)
      }
    }
  })

  return {
    totalRespondiveis,
    chIntensidadePorPerguntaId,
  }
}

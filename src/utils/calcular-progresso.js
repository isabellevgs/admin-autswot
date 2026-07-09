/**
 * Verifica se uma resposta do questionário está completa (alinhado ao app/API).
 */
export function respostaQuestionarioCompleta(resposta, catalogo = null) {
  if (!resposta?.resposta) return false
  if (resposta.resposta === 'nao') return true
  if (resposta.resposta === 'sim') {
    if (!resposta.frequencia) return false
    if (resposta.tipo === 'SH' && !resposta.intensidade) return false
    if (resposta.tipo === 'CH') {
      const exigeIntensidade = catalogo?.chIntensidadePorPerguntaId?.get(resposta.perguntaId)
      if (exigeIntensidade && !resposta.intensidade) return false
    }
    return true
  }
  return false
}

export function calcularProgressoRespostas(respostas, total, catalogo = null) {
  if (!total || total <= 0) return null
  const completas = (respostas ?? []).filter((r) => respostaQuestionarioCompleta(r, catalogo)).length
  return Math.min(100, Math.round((completas / total) * 100))
}

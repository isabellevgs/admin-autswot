import { useState, useEffect } from 'react'
import { X, ChevronDown, ChevronRight, MessageSquare } from 'lucide-react'
import api from '@/services/api'
import { extrairErroApi } from '@/utils/api-errors'
import {
  PERGUNTAS_TEXTO_POR_QUADRANTE,
  questoesDoQuadrante,
} from '@/constants/swot-pdf-textos'

const PERGUNTAS_POR_QUADRANTE = Object.fromEntries(
  Object.entries(PERGUNTAS_TEXTO_POR_QUADRANTE).map(([quadrante, textos]) => [
    quadrante,
    questoesDoQuadrante(quadrante).map((q, i) => ({
      id: q.id,
      texto: textos[i] ?? q.id,
    })),
  ]),
)

const QUADRANTE_LABEL = {
  ameaca:       'Ameaças',
  fraqueza:     'Fraquezas',
  oportunidade: 'Oportunidades',
  forca:        'Forças',
}

const QUADRANTE_COLOR = {
  ameaca:       'text-red-700 bg-red-50 border-red-200',
  fraqueza:     'text-orange-700 bg-orange-50 border-orange-200',
  oportunidade: 'text-blue-700 bg-blue-50 border-blue-200',
  forca:        'text-green-700 bg-green-50 border-green-200',
}

const QUADRANTE_ORDER = ['ameaca', 'fraqueza', 'oportunidade', 'forca']

// ─── Sub-componente: card de uma reflexão ────────────────────────────────────

function ReflexaoCard({ reflexao }) {
  const [aberto, setAberto] = useState(false)
  const perguntas = PERGUNTAS_POR_QUADRANTE[reflexao.quadrante] ?? []
  const respostas = reflexao.respostas ?? {}
  const respondidas = perguntas.filter(p => respostas[p.id]?.trim()).length

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setAberto(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <MessageSquare size={15} className="shrink-0 text-slate-400" />
          <span className="font-medium text-slate-800 text-sm">
            {reflexao.titulo ?? `Traço ${reflexao.numeroTraco} — ${reflexao.tipo}`}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-3">
          <span className="text-xs text-slate-500">{respondidas}/{perguntas.length} respostas</span>
          {aberto
            ? <ChevronDown size={15} className="text-slate-400" />
            : <ChevronRight size={15} className="text-slate-400" />}
        </div>
      </button>

      {aberto && (
        <div className="divide-y divide-slate-100 border-t border-slate-100">
          {perguntas.map((p, idx) => {
            const resposta = respostas[p.id]?.trim()
            return (
              <div key={p.id} className="px-4 py-3 bg-white">
                <p className="text-xs font-semibold text-slate-500 mb-1">Pergunta {idx + 1}</p>
                <p className="text-sm text-slate-700 mb-2">{p.texto}</p>
                {resposta ? (
                  <p className="text-sm text-slate-900 bg-slate-50 rounded-md px-3 py-2 whitespace-pre-wrap">{resposta}</p>
                ) : (
                  <p className="text-xs italic text-slate-400">Sem resposta</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

function ModalReflexoesTraco({ person, onClose }) {
  const [reflexoes, setReflexoes] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    if (!person?.id) return
    setLoading(true)
    api.get(`/reflexao-traco/user/${person.id}`)
      .then(res => setReflexoes(res.data))
      .catch((err) => setError(extrairErroApi(err, 'Não foi possível carregar as reflexões.')))
      .finally(() => setLoading(false))
  }, [person?.id])

  // Agrupar por quadrante
  const porQuadrante = QUADRANTE_ORDER.reduce((acc, q) => {
    acc[q] = reflexoes.filter(r => r.quadrante === q)
    return acc
  }, {})

  const totalRespondidas = reflexoes.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-xl shadow-xl">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Reflexões dos traços</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {person?.name} · {totalRespondidas} {totalRespondidas === 1 ? 'traço respondido' : 'traços respondidos'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {loading && (
            <div className="py-12 text-center text-slate-500 text-sm">Carregando reflexões...</div>
          )}
          {error && (
            <div className="py-8 text-center text-red-600 text-sm">{error}</div>
          )}
          {!loading && !error && totalRespondidas === 0 && (
            <div className="py-12 text-center text-slate-400 text-sm">
              Este usuário ainda não respondeu nenhuma reflexão.
            </div>
          )}

          {!loading && !error && QUADRANTE_ORDER.map(q => {
            const grupo = porQuadrante[q]
            if (!grupo.length) return null
            return (
              <section key={q}>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border mb-3 ${QUADRANTE_COLOR[q]}`}>
                  {QUADRANTE_LABEL[q]} · {grupo.length}
                </div>
                <div className="space-y-2">
                  {grupo.map(r => <ReflexaoCard key={r.id} reflexao={r} />)}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ModalReflexoesTraco

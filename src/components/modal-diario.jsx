import { useState, useEffect, useCallback } from 'react'
import { ChevronRight, NotebookPen } from 'lucide-react'
import api from '@/services/api'
import { extrairErroApi } from '@/utils/api-errors'

const ABAS = [
  { id: 'jornada', label: 'Jornada SWOT' },
  { id: 'autoadvocacia', label: 'Autoadvocacia' },
]

function ModalDiario({ person, onClose }) {
  const [aba, setAba] = useState('jornada')
  const [paginas, setPaginas] = useState([])
  const [quinzenas, setQuinzenas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPagina, setSelectedPagina] = useState(null)
  const [selectedQuinzena, setSelectedQuinzena] = useState(null)

  const loadData = useCallback(async () => {
    if (!person?.id) {
      setPaginas([])
      setQuinzenas([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const [jornadaRes, advRes] = await Promise.all([
        api.get(`/diario/jornada/user/${person.id}`),
        api.get(`/diario/autoadvocacia/user/${person.id}`),
      ])

      setPaginas(jornadaRes.data.paginas ?? [])
      setQuinzenas(advRes.data.quinzenas ?? [])
    } catch (err) {
      console.error('Erro ao carregar diário:', err)
      setError(extrairErroApi(err, 'Erro ao carregar diário.'))
      setPaginas([])
      setQuinzenas([])
    } finally {
      setLoading(false)
    }
  }, [person?.id])

  useEffect(() => {
    setSelectedPagina(null)
    setSelectedQuinzena(null)
    loadData()
  }, [loadData])

  if (!person) return null

  const listaAtual = aba === 'jornada' ? paginas : quinzenas

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] rounded-lg bg-white shadow-xl flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold mb-1">Diário</h2>
          <p className="text-slate-600">Pessoa: {person.name}</p>
          <div className="flex gap-2 mt-4">
            {ABAS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => { setAba(id); setSelectedPagina(null); setSelectedQuinzena(null) }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  aba === id ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center text-slate-500 py-8">Carregando…</div>
          ) : aba === 'jornada' && selectedPagina ? (
            <div>
              <button
                type="button"
                onClick={() => setSelectedPagina(null)}
                className="mb-4 text-violet-600 hover:text-violet-700 text-sm font-medium"
              >
                ← Voltar
              </button>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{selectedPagina.titulo}</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line mb-4">{selectedPagina.prompt}</p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {selectedPagina.texto?.trim() || (
                    <span className="text-gray-400 italic">Sem resposta</span>
                  )}
                </p>
              </div>
            </div>
          ) : aba === 'autoadvocacia' && selectedQuinzena ? (
            <div>
              <button
                type="button"
                onClick={() => setSelectedQuinzena(null)}
                className="mb-4 text-violet-600 hover:text-violet-700 text-sm font-medium"
              >
                ← Voltar
              </button>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {selectedQuinzena.rotulo ?? `Quinzena ${selectedQuinzena.numero}`}
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Resposta 1', texto: selectedQuinzena.resposta1 },
                  { label: 'Resposta 2', texto: selectedQuinzena.resposta2 },
                ].map(({ label, texto }) => (
                  <div key={label} className="border border-gray-200 rounded-lg p-4">
                    <p className="font-semibold text-sm text-gray-900 mb-2">{label}</p>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {texto?.trim() || <span className="text-gray-400 italic">Sem resposta</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : listaAtual.length === 0 ? (
            <div className="text-center py-12">
              <NotebookPen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma entrada registrada ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {aba === 'jornada'
                ? paginas.map((pagina) => (
                    <button
                      key={pagina.chave}
                      type="button"
                      onClick={() => setSelectedPagina(pagina)}
                      className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-violet-300 hover:bg-violet-50 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{pagina.titulo}</p>
                        <p className="text-sm text-gray-500">
                          {pagina.concluida ? 'Concluída' : pagina.texto?.trim() ? 'Rascunho' : 'Sem resposta'}
                          {pagina.arquivada ? ' · Arquivada' : ''}
                          {!pagina.desbloqueada && !pagina.arquivada ? ' · Bloqueada' : ''}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  ))
                : quinzenas.map((q) => (
                    <button
                      key={q.numero}
                      type="button"
                      onClick={() => setSelectedQuinzena(q)}
                      className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-violet-300 hover:bg-violet-50 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {q.rotulo ?? `Quinzena ${q.numero}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {q.concluida ? 'Concluída' : 'Rascunho'}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-4">
          <button
            type="button"
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalDiario

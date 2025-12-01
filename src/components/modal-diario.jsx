import { useState, useEffect } from 'react'
import { Calendar, ChevronRight } from 'lucide-react'
import api from '@/services/api'

function ModalDiario({ person, onClose }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedEntry, setSelectedEntry] = useState(null)

  if (!person) return null

  // Carregar entradas do diário ao abrir o modal
  useEffect(() => {
    if (person?.id) {
      loadEntries()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person?.id])

  const loadEntries = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Verificar se person.id é um UUID válido
      if (!person.id || typeof person.id !== 'string' || !person.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        console.error('ID inválido:', person.id)
        setError('ID da pessoa inválido.')
        setEntries([])
        setLoading(false)
        return
      }

      const response = await api.get(`/diary/user/${person.id}`)
      // Ordenar por data (mais recente primeiro)
      const sortedEntries = (response.data.entries || []).sort((a, b) => {
        return new Date(b.date) - new Date(a.date)
      })
      setEntries(sortedEntries)
    } catch (err) {
      console.error('Erro ao carregar entradas do diário:', err)
      const errorMessage = err.response?.data?.error || err.message || 'Erro desconhecido'
      const statusCode = err.response?.status
      
      if (statusCode === 404) {
        setError('Usuário não encontrado.')
      } else if (statusCode === 401) {
        setError('Não autorizado. Faça login novamente.')
      } else if (statusCode === 403) {
        setError('Acesso negado. Você não tem permissão para ver estas entradas.')
      } else {
        setError(`Erro ao carregar entradas: ${errorMessage}`)
      }
      setEntries([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const formatDateShort = (dateString) => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    return `${day}/${month}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] rounded-lg bg-white shadow-xl flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold mb-2">Anotações no Diário</h2>
          <p className="text-slate-600">Pessoa: {person.name}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center text-slate-500 py-8">Carregando entradas...</div>
          ) : selectedEntry ? (
            // Visualização detalhada de uma entrada
            <div>
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="mb-4 text-violet-600 hover:text-violet-700 flex items-center gap-2 text-sm font-medium"
              >
                ← Voltar para lista
              </button>
              
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {formatDate(selectedEntry.date)}
                </h3>
              </div>

              <div className="space-y-4">
                {selectedEntry.answers && selectedEntry.answers.length > 0 ? (
                  selectedEntry.answers
                    .sort((a, b) => a.question?.ordem - b.question?.ordem)
                    .map((answer) => (
                      <div key={answer.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="mb-2">
                          <p className="font-semibold text-gray-900 text-sm mb-1">
                            {answer.question?.texto || 'Pergunta não encontrada'}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-md p-3">
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {answer.texto || <span className="text-gray-400 italic">Sem resposta</span>}
                          </p>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-500 text-center py-8">Nenhuma resposta registrada para esta data.</p>
                )}
              </div>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Nenhuma entrada encontrada</p>
              <p className="text-gray-400 text-sm mt-2">Esta pessoa ainda não possui anotações no diário.</p>
            </div>
          ) : (
            // Lista de entradas
            <div className="space-y-3">
              {entries.map((entry) => {
                const answerCount = entry.answers?.length || 0
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setSelectedEntry(entry)}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-violet-300 hover:bg-violet-50 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-violet-100 text-violet-600">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{formatDate(entry.date)}</p>
                        <p className="text-sm text-gray-500">
                          {answerCount === 0
                            ? 'Nenhuma resposta'
                            : `${answerCount} ${answerCount === 1 ? 'resposta' : 'respostas'}`
                          }
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-violet-600 transition-colors" />
                  </button>
                )
              })}
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


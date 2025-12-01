import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import ItemPergunta from '@/components/item-pergunta'
import api from '@/services/api'

function ModalPerguntas({ person, onClose }) {
  const [perguntas, setPerguntas] = useState([])
  const [originalPerguntas, setOriginalPerguntas] = useState([]) // Cópia original para restaurar ao fechar sem salvar
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [pendingUpdates, setPendingUpdates] = useState({}) // Armazena mudanças pendentes { id: novoTexto }

  if (!person) return null

  // Carregar perguntas ao abrir o modal
  useEffect(() => {
    if (person?.id) {
      loadPerguntas()
      setPendingUpdates({}) // Limpar mudanças pendentes ao recarregar
      setOriginalPerguntas([]) // Limpar original ao recarregar
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person?.id])

  const loadPerguntas = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Verificar se person.id é um UUID válido
      if (!person.id || typeof person.id !== 'string' || !person.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        console.error('ID inválido:', person.id)
        setError('ID da pessoa inválido. As pessoas precisam ser carregadas da API.')
        setPerguntas([])
        setLoading(false)
        return
      }

      const response = await api.get(`/questions/user/${person.id}`)
      // Garantir que todas as perguntas tenham o campo ativo definido (padrão true)
      const questions = (response.data.questions || []).map(q => ({
        ...q,
        ativo: q.ativo !== false // Se for undefined/null, considera como true
      }))
      // Criar cópia profunda para manter original
      setPerguntas(questions)
      setOriginalPerguntas(JSON.parse(JSON.stringify(questions)))
    } catch (err) {
      console.error('Erro ao carregar perguntas:', err)
      const errorMessage = err.response?.data?.error || err.message || 'Erro desconhecido'
      const statusCode = err.response?.status
      
      if (statusCode === 404) {
        setError('Usuário não encontrado. Verifique se o ID está correto.')
      } else if (statusCode === 401) {
        setError('Não autorizado. Faça login novamente.')
      } else if (statusCode === 403) {
        setError('Acesso negado. Você não tem permissão para ver estas perguntas.')
      } else {
        setError(`Erro ao carregar perguntas: ${errorMessage}`)
      }
      setPerguntas([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddPergunta = async () => {
    try {
      setError(null)
      
      if (!person.id || typeof person.id !== 'string' || !person.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        setError('ID da pessoa inválido.')
        return
      }

      const response = await api.post(`/questions/user/${person.id}`, {
        texto: `Nova pergunta ${perguntas.length + 1}`,
      })
      // Garantir que a nova pergunta tenha o campo ativo definido
      const newQuestion = {
        ...response.data.question,
        ativo: response.data.question.ativo !== false
      }
      const updatedPerguntas = [...perguntas, newQuestion]
      setPerguntas(updatedPerguntas)
      // Atualizar original já que a adição é salva imediatamente
      setOriginalPerguntas(JSON.parse(JSON.stringify(updatedPerguntas)))
    } catch (err) {
      console.error('Erro ao criar pergunta:', err)
      const errorMessage = err.response?.data?.error || err.message || 'Erro desconhecido'
      setError(`Erro ao criar pergunta: ${errorMessage}`)
    }
  }

  const handleRemovePergunta = async (id) => {
    try {
      setError(null)
      await api.delete(`/questions/${id}`)
      const updatedPerguntas = perguntas.filter((p) => p.id !== id)
      setPerguntas(updatedPerguntas)
      // Atualizar original já que a remoção é salva imediatamente
      setOriginalPerguntas(JSON.parse(JSON.stringify(updatedPerguntas)))
    } catch (err) {
      console.error('Erro ao remover pergunta:', err)
      setError('Erro ao remover pergunta. Tente novamente.')
    }
  }

  const handleMoveUp = async (index) => {
    if (index === 0) return
    await reorderPerguntas(index, index - 1)
  }

  const handleMoveDown = async (index) => {
    if (index === perguntas.length - 1) return
    await reorderPerguntas(index, index + 1)
  }

  const reorderPerguntas = async (fromIndex, toIndex) => {
    try {
      setError(null)
      const newPerguntas = [...perguntas]
      const temp = newPerguntas[fromIndex]
      newPerguntas[fromIndex] = newPerguntas[toIndex]
      newPerguntas[toIndex] = temp

      // Atualizar ordem
      const questionsToUpdate = newPerguntas.map((p, idx) => ({
        id: p.id,
        ordem: idx + 1,
      }))

      const response = await api.post('/questions/reorder', {
        questions: questionsToUpdate,
      })
      const updatedPerguntas = response.data.questions.map(q => ({
        ...q,
        ativo: q.ativo !== false
      }))
      setPerguntas(updatedPerguntas)
      // Atualizar original já que a reordenação é salva imediatamente
      setOriginalPerguntas(JSON.parse(JSON.stringify(updatedPerguntas)))
    } catch (err) {
      console.error('Erro ao reordenar perguntas:', err)
      setError('Erro ao reordenar perguntas. Tente novamente.')
      // Recarregar perguntas em caso de erro
      loadPerguntas()
    }
  }

  // Atualizar apenas localmente (não salva na API ainda)
  const handleUpdatePergunta = (id, novoTexto) => {
    setPendingUpdates((prev) => {
      const existing = prev[id] || {}
      return {
        ...prev,
        [id]: {
          ...existing,
          texto: novoTexto,
        },
      }
    })
    // Atualizar visualmente
    setPerguntas(
      perguntas.map((p) => (p.id === id ? { ...p, texto: novoTexto } : p))
    )
  }

  // Toggle ativo/inativo (apenas local, salva quando clicar em Salvar)
  const handleToggleAtivo = (id) => {
    const pergunta = perguntas.find((p) => p.id === id)
    if (!pergunta) return

    // Garantir que ativo seja boolean (pode vir undefined/null)
    const statusAtual = pergunta.ativo !== false
    const novoStatus = !statusAtual
    
    // Atualizar visualmente imediatamente
    setPerguntas(
      perguntas.map((p) => (p.id === id ? { ...p, ativo: novoStatus } : p))
    )
    
    // Adicionar/atualizar em pendingUpdates
    setPendingUpdates((prev) => {
      const existing = prev[id] || {}
      return {
        ...prev,
        [id]: {
          ...existing,
          ativo: novoStatus,
        },
      }
    })
  }

  // Salvar todas as mudanças pendentes
  const savePendingUpdates = async () => {
    const updates = Object.entries(pendingUpdates)
    if (updates.length === 0) return

    const updatePromises = updates.map(([id, data]) => {
      // Garantir que o objeto de update tenha pelo menos um campo
      const updateData = {}
      if (data.texto !== undefined) updateData.texto = data.texto
      if (data.ativo !== undefined) updateData.ativo = data.ativo
      
      // Só fazer a requisição se houver algo para atualizar
      if (Object.keys(updateData).length > 0) {
        return api.put(`/questions/${id}`, updateData)
      }
      return Promise.resolve()
    })

    try {
      await Promise.all(updatePromises)
      setPendingUpdates({})
    } catch (err) {
      console.error('Erro ao salvar atualizações:', err)
      throw err
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      
      // Salvar todas as mudanças pendentes
      await savePendingUpdates()
      
      // Recarregar perguntas para garantir que está tudo sincronizado
      await loadPerguntas()
      
      // Limpar mudanças pendentes
      setPendingUpdates({})
      
      // Fechar o modal após salvar
      onClose()
    } catch (err) {
      console.error('Erro ao salvar:', err)
      const errorMessage = err.response?.data?.error || err.message || 'Erro desconhecido'
      setError(`Erro ao salvar: ${errorMessage}`)
      // Não fechar se houver erro
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    // Restaurar perguntas originais ao fechar sem salvar
    setPerguntas(JSON.parse(JSON.stringify(originalPerguntas)))
    setPendingUpdates({})
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] rounded-lg bg-white shadow-xl flex flex-col">
        <div className="p-6 overflow-y-auto flex-1">
          <h2 className="text-xl font-bold mb-4">Perguntas</h2>
          <p className="text-slate-600 mb-6">Pessoa: {person.name}</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleAddPergunta}
            disabled={loading}
            className="mb-4 w-full px-4 py-2 rounded-md border border-violet-600 bg-transparent text-violet-600 hover:bg-violet-600 hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Adicionar pergunta
          </button>

          {loading ? (
            <div className="text-center text-slate-500 py-8">Carregando perguntas...</div>
          ) : (
            <div className="space-y-3">
              {perguntas.map((pergunta, index) => (
                <ItemPergunta
                  key={pergunta.id}
                  pergunta={pergunta}
                  index={index}
                  totalPerguntas={perguntas.length}
                  onUpdate={handleUpdatePergunta}
                  onRemove={handleRemovePergunta}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onToggleAtivo={handleToggleAtivo}
                />
              ))}

              {perguntas.length === 0 && !loading && (
                <p className="text-center text-slate-500 py-8">
                  Nenhuma pergunta adicionada ainda
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-4">
          <button
            type="button"
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={handleClose}
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || saving}
            className="px-4 py-2 rounded-md bg-violet-700 text-white hover:bg-violet-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalPerguntas

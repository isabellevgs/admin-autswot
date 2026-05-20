import { useState, useEffect, useCallback } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import api from '@/services/api'
import PerguntaRow from '@/components/pergunta-row'
import ModalPerguntaForm from '@/components/modal-pergunta-form'

function PerguntaTipoPanel({ tipo }) {
  const [perguntas, setPerguntas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modal, setModal] = useState(null) // null | 'novo' | objeto pergunta

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(tipo.endpoint, { params: { page: 1, limit: 500 } })
      setPerguntas(res.data?.registros ?? [])
    } catch {
      setError('Erro ao carregar perguntas.')
    } finally {
      setLoading(false)
    }
  }, [tipo.endpoint])

  useEffect(() => { load() }, [load])

  const handleSave = (saved) => {
    if (!saved) { load(); setModal(null); return }
    setPerguntas((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id)
      return idx >= 0
        ? prev.map((p) => (p.id === saved.id ? saved : p))
        : [...prev, saved]
    })
    setModal(null)
  }

  const handleDelete = (id) => setPerguntas((prev) => prev.filter((p) => p.id !== id))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          {perguntas.length} pergunta{perguntas.length !== 1 ? 's' : ''}
        </p>
        <button
          type="button"
          onClick={() => setModal('novo')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
        >
          <Plus size={15} />
          Nova pergunta
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Carregando...</span>
        </div>
      ) : perguntas.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">Nenhuma pergunta cadastrada</div>
      ) : (
        <div className="rounded-xl border border-violet-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-violet-100 bg-violet-50/60">
                <th className="px-5 py-3 text-left font-semibold text-slate-600 w-20">Ordem</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Pergunta</th>
                <th className="px-5 py-3 text-right font-semibold text-slate-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {perguntas.map((p, idx) => (
                <PerguntaRow
                  key={p.id}
                  pergunta={p}
                  tipo={tipo}
                  isLast={idx === perguntas.length - 1}
                  onEdit={(pg) => setModal(pg)}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <ModalPerguntaForm
          tipo={tipo}
          pergunta={modal === 'novo' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}

export default PerguntaTipoPanel

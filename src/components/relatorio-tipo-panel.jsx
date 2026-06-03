import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Loader2, Search as SearchIcon } from 'lucide-react'
import api from '@/services/api'
import RelatorioRow from '@/components/relatorio-row'
import ModalRelatorioForm from '@/components/modal-relatorio-form'
import { ENDPOINT_CH, ENDPOINT_SH } from '@/constants/relatorios-config'

function RelatorioTipoPanel({ tipo }) {
  const [relatorios, setRelatorios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modal, setModal] = useState(null)
  const [busca, setBusca] = useState('')

  const load = useCallback(async () => {
    if (!tipo?.disponivel) return
    setLoading(true)
    setError(null)
    try {
      if (tipo.variant === 'ameaca') {
        const [resSh, resCh] = await Promise.all([
          api.get(ENDPOINT_SH),
          api.get(ENDPOINT_CH),
        ])
        const sh = (Array.isArray(resSh.data) ? resSh.data : []).map((r) => ({ ...r, tipoRelatorio: 'SH' }))
        const ch = (Array.isArray(resCh.data) ? resCh.data : []).map((r) => ({ ...r, tipoRelatorio: 'CH' }))
        setRelatorios([...sh, ...ch].sort((a, b) => {
          if (a.tipoRelatorio !== b.tipoRelatorio) return a.tipoRelatorio.localeCompare(b.tipoRelatorio)
          return a.numeroTraco - b.numeroTraco
        }))
      } else if (tipo.tipoBanco) {
        const res = await api.get(tipo.endpoint)
        const lista = (Array.isArray(res.data) ? res.data : [])
          .filter((r) => r.tipo === tipo.tipoBanco)
          .map((r) => ({ ...r, tipoRelatorio: tipo.tipoBanco }))
          .sort((a, b) => a.numeroTraco - b.numeroTraco)
        setRelatorios(lista)
      } else {
        const res = await api.get(tipo.endpoint)
        setRelatorios(Array.isArray(res.data) ? res.data : [])
      }
    } catch {
      setError('Erro ao carregar relatórios.')
    } finally {
      setLoading(false)
    }
  }, [tipo])

  useEffect(() => { load() }, [load])

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return relatorios
    return relatorios.filter((r) =>
      (r.titulo ?? '').toLowerCase().includes(termo) ||
      String(r.numeroTraco).includes(termo) ||
      (r.tipoRelatorio ?? '').toLowerCase().includes(termo)
    )
  }, [relatorios, busca])

  const handleSave = (saved) => {
    if (!saved) { load(); setModal(null); return }
    setRelatorios((prev) => {
      const idx = prev.findIndex((r) => r.id === saved.id && r.tipoRelatorio === saved.tipoRelatorio)
      if (idx >= 0) {
        return prev.map((r, i) => (i === idx ? saved : r))
      }
      return [...prev, saved].sort((a, b) => {
        if (a.tipoRelatorio !== b.tipoRelatorio) return a.tipoRelatorio.localeCompare(b.tipoRelatorio)
        return a.numeroTraco - b.numeroTraco
      })
    })
    setModal(null)
  }

  const handleDelete = (id, tipoRelatorio) => {
    setRelatorios((prev) => prev.filter((r) => !(r.id === id && r.tipoRelatorio === tipoRelatorio)))
  }

  if (!tipo?.disponivel) {
    return (
      <div className="text-center py-12 text-slate-400 text-sm">
        Este tipo de relatório será disponibilizado em breve.
      </div>
    )
  }

  const mostrarColunaTipo = tipo.variant === 'ameaca'

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <p className="text-sm text-slate-500">
          {filtrados.length} relatório{filtrados.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-3">
          <div className="relative">
            <SearchIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por título, nº ou tipo..."
              className="pl-9 pr-3 py-2 w-52 sm:w-64 rounded-lg border border-violet-200 text-sm outline-none focus:border-violet-400"
            />
          </div>
          <button
            type="button"
            onClick={() => setModal('novo')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors shrink-0"
          >
            <Plus size={15} />
            Novo relatório
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Carregando...</span>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          {busca ? 'Nenhum relatório encontrado para a busca' : 'Nenhum relatório cadastrado'}
        </div>
      ) : (
        <div className="rounded-xl border border-violet-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-violet-100 bg-violet-50/60">
                {mostrarColunaTipo && (
                  <th className="px-5 py-3 text-left font-semibold text-slate-600 w-16">Tipo</th>
                )}
                <th className="px-5 py-3 text-left font-semibold text-slate-600 w-20">Nº</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Título</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600 hidden md:table-cell">Conteúdo</th>
                <th className="px-5 py-3 text-right font-semibold text-slate-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((r, idx) => (
                <RelatorioRow
                  key={`${r.tipoRelatorio ?? 'X'}-${r.id}`}
                  relatorio={r}
                  mostrarTipo={mostrarColunaTipo}
                  isLast={idx === filtrados.length - 1}
                  onEdit={(rel) => setModal(rel)}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <ModalRelatorioForm
          tipo={tipo}
          relatorio={modal === 'novo' ? null : modal}
          relatoriosExistentes={relatorios}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}

export default RelatorioTipoPanel

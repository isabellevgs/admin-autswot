import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import api from '@/services/api'
import ModalConfirmarExclusao from '@/components/modal-confirmar-exclusao'
import { endpointDoRelatorio } from '@/constants/relatorios-config'

function RelatorioRow({ relatorio, mostrarTipo, isLast, onEdit, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleConfirmDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`${endpointDoRelatorio(relatorio)}/${relatorio.id}`)
      onDelete(relatorio.id, relatorio.tipoRelatorio)
    } catch {
      setDeleting(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <tr className={`transition-colors hover:bg-violet-50/40 ${!isLast ? 'border-b border-violet-100' : ''}`}>
        {mostrarTipo && (
          <td className="px-5 py-3 text-slate-600 text-sm font-medium">{relatorio.tipoRelatorio ?? '—'}</td>
        )}
        <td className="px-5 py-3 text-slate-500 text-sm w-20">{relatorio.numeroTraco ?? '—'}</td>
        <td className="px-5 py-3 text-slate-800 text-sm font-medium">{relatorio.titulo ?? '—'}</td>
        <td className="px-5 py-3 text-right">
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => onEdit(relatorio)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
              title="Editar"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Excluir"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </td>
      </tr>

      {showConfirm && (
        <ModalConfirmarExclusao
          titulo="Excluir relatório"
          descricao={relatorio.titulo ?? `Traço ${relatorio.numeroTraco}`}
          carregando={deleting}
          onConfirmar={handleConfirmDelete}
          onCancelar={() => setShowConfirm(false)}
        />
      )}
    </>
  )
}

export default RelatorioRow

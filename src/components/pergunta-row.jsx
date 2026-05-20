import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import api from '@/services/api'
import ModalConfirmarExclusao from '@/components/modal-confirmar-exclusao'

function PerguntaRow({ pergunta, tipo, isLast, onEdit, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleConfirmDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`${tipo.endpoint}/${pergunta.id}`)
      onDelete(pergunta.id)
    } catch {
      setDeleting(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <tr className={`transition-colors hover:bg-violet-50/40 ${!isLast ? 'border-b border-violet-100' : ''}`}>
        <td className="px-5 py-3 text-slate-500 text-sm w-20">{pergunta[tipo.campoOrdem ?? 'numeroTraco'] ?? '—'}</td>
        <td className="px-5 py-3 text-slate-800 text-sm">{pergunta[tipo.campoTexto] ?? '—'}</td>
        <td className="px-5 py-3 text-right">
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => onEdit(pergunta)}
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
          titulo="Excluir pergunta"
          descricao={pergunta[tipo.campoTexto] ?? `Traço ${pergunta.numeroTraco}`}
          carregando={deleting}
          onConfirmar={handleConfirmDelete}
          onCancelar={() => setShowConfirm(false)}
        />
      )}
    </>
  )
}

export default PerguntaRow

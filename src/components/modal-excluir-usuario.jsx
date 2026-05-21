import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, AlertTriangle } from 'lucide-react'
import api from '@/services/api'

function ModalExcluirUsuario({ person, onClose, onDeleted }) {
  const [excluindo, setExcluindo] = useState(false)
  const [erro, setErro] = useState(null)

  async function handleConfirmar() {
    setExcluindo(true)
    setErro(null)
    try {
      await api.delete(`/users/${person.id}`)
      onDeleted?.()
      onClose()
    } catch (err) {
      setErro(
        err?.response?.data?.error ??
          err?.response?.data?.message ??
          'Não foi possível excluir o usuário. Tente novamente.'
      )
      setExcluindo(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Excluir usuário</h2>
            <p className="text-xs text-red-500 mt-0.5">Esta ação não pode ser desfeita</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 mb-4 space-y-2">
          <p className="text-sm text-slate-800 font-medium">{person?.name}</p>
          <p className="text-sm text-slate-600">{person?.email}</p>
          <p className="text-xs text-slate-500 pt-1">
            Serão removidos permanentemente: SWOT, diário, perguntas, reflexões e demais dados vinculados.
          </p>
        </div>

        {erro && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
            {erro}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={excluindo}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={excluindo}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {excluindo && <Loader2 size={14} className="animate-spin" />}
            {excluindo ? 'Excluindo...' : 'Sim, excluir'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ModalExcluirUsuario

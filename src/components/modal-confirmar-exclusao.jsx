import { createPortal } from 'react-dom'
import { Loader2, AlertTriangle } from 'lucide-react'

function ModalConfirmarExclusao({ titulo, descricao, carregando, erro, onConfirmar, onCancelar }) {
  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="absolute inset-0 bg-black/40" onClick={onCancelar} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">{titulo}</h2>
            <p className="text-xs text-red-500 mt-0.5">Esta ação não pode ser desfeita</p>
          </div>
        </div>

        {descricao && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 mb-6">
            <p className="text-sm text-slate-700 font-medium line-clamp-3">{descricao}</p>
          </div>
        )}

        {erro && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
            {erro}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancelar}
            disabled={carregando}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={carregando}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {carregando && <Loader2 size={14} className="animate-spin" />}
            {carregando ? 'Excluindo...' : 'Sim, excluir'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ModalConfirmarExclusao

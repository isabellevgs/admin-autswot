import { useState } from 'react'
import { ChevronUp, ChevronDown, X, Edit2, Check, Trash2, Eye, EyeOff } from 'lucide-react'

function ItemPergunta({
  pergunta,
  index,
  totalPerguntas,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  onToggleAtivo,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState(pergunta.texto)

  const handleEdit = () => {
    setIsEditing(true)
    setEditedText(pergunta.texto)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedText(pergunta.texto)
  }

  const handleSave = () => {
    if (editedText.trim() !== pergunta.texto) {
      onUpdate(pergunta.id, editedText.trim())
    }
    setIsEditing(false)
  }

  // Garantir que ativo seja boolean (pode vir undefined/null do banco)
  const isAtivo = pergunta.ativo !== false

  return (
    <div className={`flex items-center gap-2 p-3 border-2 rounded-lg transition-colors ${
      isAtivo 
        ? 'border-green-300 hover:border-green-400 bg-green-50/30' 
        : 'border-red-300 hover:border-red-400 bg-red-50/30'
    }`}>
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => onMoveUp(index)}
          disabled={index === 0 || isEditing}
          className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Mover para cima"
        >
          <ChevronUp className="w-4 h-4 text-slate-600" />
        </button>
        <button
          type="button"
          onClick={() => onMoveDown(index)}
          disabled={index === totalPerguntas - 1 || isEditing}
          className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Mover para baixo"
        >
          <ChevronDown className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {isEditing ? (
        <>
          <input
            type="text"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="flex-1 px-3 py-2 border border-violet-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="Digite a pergunta..."
            autoFocus
          />
          <button
            type="button"
            onClick={handleSave}
            className="p-2 rounded hover:bg-green-50 text-green-600 transition-colors"
            title="Salvar edição"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="p-2 rounded hover:bg-red-50 text-red-600 transition-colors"
            title="Cancelar edição"
          >
            <X className="w-4 h-4" />
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            value={pergunta.texto}
            readOnly
            className={`flex-1 px-3 py-2 border rounded-md cursor-not-allowed ${
              isAtivo 
                ? 'border-slate-300 bg-slate-50' 
                : 'border-slate-200 bg-slate-100 opacity-60'
            }`}
            placeholder="Digite a pergunta..."
          />
          <button
            type="button"
            onClick={handleEdit}
            className="p-2 rounded hover:bg-violet-50 text-violet-600 transition-colors"
            title="Editar pergunta"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onToggleAtivo(pergunta.id)}
            className={`p-2 rounded transition-colors ${
              isAtivo
                ? 'hover:bg-yellow-50 text-yellow-600'
                : 'hover:bg-green-50 text-green-600'
            }`}
            title={isAtivo ? 'Inativar pergunta' : 'Ativar pergunta'}
          >
            {isAtivo ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onRemove(pergunta.id)}
            className="p-2 rounded hover:bg-red-50 text-red-600 transition-colors"
            title="Remover pergunta"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  )
}

export default ItemPergunta


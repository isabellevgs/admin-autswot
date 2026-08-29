import { Plus, X } from 'lucide-react'
import AutoResizeTextarea from '@/components/auto-resize-textarea'

function BulletListField({ value, onChange, placeholder = 'Digite o texto do item...', renderExtra }) {
  const items = Array.isArray(value) && value.length > 0 ? value : ['']
  const updateItem = (idx, text) => {
    onChange(items.map((item, i) => (i === idx ? text : item)))
  }
  const addItem = () => onChange([...items, ''])
  const removeItem = (idx) => {
    if (items.length === 1) {
      onChange([''])
      return
    }
    onChange(items.filter((_, i) => i !== idx))
  }
  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-start gap-2">
          <span className="text-slate-400 text-sm mt-2.5 shrink-0 select-none">•</span>
          <div className="flex-1 min-w-0">
            <AutoResizeTextarea
              value={item}
              onChange={(e) => updateItem(idx, e.target.value)}
              placeholder={placeholder}
              minRows={1}
            />
            {renderExtra && <div className="mt-1">{renderExtra(item, idx)}</div>}
          </div>
          <button
            type="button"
            onClick={() => removeItem(idx)}
            className="mt-1.5 p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
            title="Remover item"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-violet-300 text-violet-600 text-xs font-medium hover:bg-violet-50 transition-colors"
      >
        <Plus size={13} />
        Adicionar item
      </button>
    </div>
  )
}
export default BulletListField

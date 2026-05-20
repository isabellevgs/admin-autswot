import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

function SortableTh({ sortKey, label, sort, onSort }) {
  const active = sort.key === sortKey
  const Icon = active
    ? sort.dir === 'asc' ? ChevronUp : ChevronDown
    : ChevronsUpDown

  return (
    <th
      onClick={() => onSort(sortKey)}
      className="px-5 py-3 text-left font-semibold text-slate-600 cursor-pointer select-none hover:text-slate-900 transition-colors"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <Icon size={14} className={active ? 'text-violet-600' : 'text-slate-400'} />
      </span>
    </th>
  )
}

export default SortableTh

function PessoaProgresso({ pct }) {
  if (pct === null) return <span className="text-slate-300 text-sm">—</span>

  const color =
    pct === 100
      ? 'text-green-600'
      : pct === 0
      ? 'text-red-500'
      : 'text-blue-500'

  return <span className={`text-sm font-medium ${color}`}>{pct}%</span>
}

export default PessoaProgresso

import SortableTh from '@/components/sortable-th'
import PessoaProgresso from '@/components/pessoa-progresso'
import PessoaActionsMenu from '@/components/pessoa-actions-menu'

const COLUMNS = [
  { key: 'name', label: 'Nome' },
  { key: 'email', label: 'E-mail' },
  { key: 'progresso', label: 'Progresso' },
]

function PessoasTable({ pessoas, progressMap, sort, onSort, onOpenQuestionario, onOpenDiario, onOpenReflexoes, onVerCadastro, onRedefinirSenha, onExcluirUsuario }) {
  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            {COLUMNS.map(({ key, label }) => (
              <SortableTh key={key} sortKey={key} label={label} sort={sort} onSort={onSort} />
            ))}
            <th className="px-5 py-3 text-right font-semibold text-slate-600">Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {pessoas.map((person, idx) => (
            <tr
              key={person.id}
              className={`transition-colors hover:bg-slate-50 ${idx !== pessoas.length - 1 ? 'border-b border-slate-100' : ''}`}
            >
              <td className="px-5 py-3 font-medium text-slate-800">{person.name}</td>
              <td className="px-5 py-3 text-slate-500">{person.email ?? '—'}</td>
              <td className="px-5 py-3">
                {!(person.id in progressMap) ? (
                  <div className="h-3 w-10 bg-slate-100 rounded animate-pulse" />
                ) : (
                  <PessoaProgresso pct={progressMap[person.id]} />
                )}
              </td>
              <td className="px-5 py-3 text-right">
                <PessoaActionsMenu
                  person={person}
                  onOpenQuestionario={onOpenQuestionario}
                  onOpenDiario={onOpenDiario}
                  onOpenReflexoes={onOpenReflexoes}
                  onVerCadastro={onVerCadastro}
                  onRedefinirSenha={onRedefinirSenha}
                  onExcluirUsuario={onExcluirUsuario}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default PessoasTable

export function infoUsuarioExtra(email, infoPorEmail) {
  const emailNormalizado = email.trim().toLowerCase()
  if (!emailNormalizado || !emailNormalizado.includes('@')) return null
  const info = infoPorEmail[emailNormalizado]
  if (!info || info.carregando) return null
  if (info.erro) return <span className="text-xs text-red-300">{info.erro}</span>
  if (info.nome) {
    return (
      <span className="text-xs text-slate-500">
        {info.nome} · cadastrado em {new Date(info.dataCadastro).toLocaleDateString('pt-BR')}
      </span>
    )
  }
  return <span className="text-xs text-amber-400">Usuário não encontrado</span>
}

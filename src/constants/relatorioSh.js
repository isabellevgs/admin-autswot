export const CATEGORIAS_ATRAPALHAR = [
  { field: 'atrapalharAcademico', label: 'Acadêmico (faculdade, local de estudo, etc.)' },
  { field: 'atrapalharProfissional', label: 'Profissional' },
  { field: 'atrapalharFamiliar', label: 'Familiar' },
  { field: 'atrapalharAmigosColegas', label: 'Amigos e colegas de estudo ou trabalho' },
  { field: 'atrapalharParceiros', label: 'Parceiros românticos' },
]

export const CATEGORIAS_EXEMPLOS_OPORTUNIDADE = [
  { field: 'exemplosOportunidadeAcademico', label: 'Acadêmico (faculdade, local de estudo, etc.)' },
  { field: 'exemplosOportunidadeProfissional', label: 'Profissional' },
  { field: 'exemplosOportunidadeFamiliar', label: 'Familiar' },
  { field: 'exemplosOportunidadeAmigosColegas', label: 'Amigos e colegas de estudo ou trabalho' },
  { field: 'exemplosOportunidadeParceiros', label: 'Parceiros românticos' },
]

export const CATEGORIAS_EXEMPLOS_PRATICOS_FORCA = [
  { field: 'exemplosPraticosEstudo', label: '' },
  { field: 'exemplosPraticosTrabalho', label: '' },
  { field: 'exemplosPraticosCotidiano', label: '' },
]

export function montarItensPorCategoria(detalhe, categorias, legacyArray = []) {
  if (!detalhe) return []
  const temFormatoEstruturado = categorias.some(({ field }) => detalhe[field]?.trim?.())
  if (temFormatoEstruturado) {
    return categorias
      .map(({ field, label }) => {
        const texto = (detalhe[field] ?? '').trim()
        return texto ? `${label}: ${texto}` : null
      })
      .filter(Boolean)
  }
  return Array.isArray(legacyArray) ? legacyArray : []
}

export function montarItensAtrapalhar(detalhe) {
  return montarItensPorCategoria(detalhe, CATEGORIAS_ATRAPALHAR, detalhe?.comoAtrapalhar ?? [])
}

export const CATEGORIAS_COMO_USAR = [
  { field: 'comoUsarAcademico', label: 'Na faculdade' },
  { field: 'comoUsarProfissional', label: 'No trabalho' },
  { field: 'comoUsarCotidiano', label: 'Na vida pessoal' },
]

export function montarComoUsar(detalhe) {
  return montarItensPorCategoria(detalhe, CATEGORIAS_COMO_USAR, detalhe?.comoUsar ?? [])
}

export function montarExemplosOportunidade(detalhe) {
  return montarItensPorCategoria(detalhe, CATEGORIAS_EXEMPLOS_OPORTUNIDADE, detalhe?.exemplosOportunidade ?? [])
}

export function montarExemplosPraticosForca(detalhe) {
  return montarItensPorCategoria(detalhe, CATEGORIAS_EXEMPLOS_PRATICOS_FORCA, [])
}

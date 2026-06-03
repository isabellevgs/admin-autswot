export const ENDPOINT_SH = '/relatorio-sh'
export const ENDPOINT_CH = '/relatorio-ch'

export const TIPOS_RELATORIO_TRACO = {
  SH: {
    key: 'SH',
    label: 'Sem história social (SH)',
    endpoint: ENDPOINT_SH,
    tracosEndpoint: '/fraquezas-ameacas-sh',
  },
  CH: {
    key: 'CH',
    label: 'Com histórias sociais (CH)',
    endpoint: ENDPOINT_CH,
    tracosEndpoint: '/fraquezas-ameacas-ch',
  },
}

export const CATEGORIAS_ATRAPALHAR = [
  { name: 'atrapalharAcademico', label: 'Acadêmico (faculdade, local de estudo, etc.)' },
  { name: 'atrapalharProfissional', label: 'Profissional' },
  { name: 'atrapalharFamiliar', label: 'Familiar' },
  { name: 'atrapalharAmigosColegas', label: 'Amigos e colegas de estudo ou trabalho' },
  { name: 'atrapalharParceiros', label: 'Parceiros românticos' },
]

export const CATEGORIAS_EXEMPLOS_OPORTUNIDADE = [
  { name: 'exemplosOportunidadeAcademico', label: 'Acadêmico (faculdade, local de estudo, etc.)' },
  { name: 'exemplosOportunidadeProfissional', label: 'Profissional' },
  { name: 'exemplosOportunidadeFamiliar', label: 'Familiar' },
  { name: 'exemplosOportunidadeAmigosColegas', label: 'Amigos e colegas de estudo ou trabalho' },
  { name: 'exemplosOportunidadeParceiros', label: 'Parceiros românticos' },
]

export const CATEGORIAS_EXEMPLOS_PRATICOS_FORCA = [
  { name: 'exemplosPraticosEstudo', label: 'No estudo' },
  { name: 'exemplosPraticosTrabalho', label: 'No trabalho' },
  { name: 'exemplosPraticosCotidiano', label: 'No cotidiano' },
]

export const GRUPOS_RELATORIO = {
  atrapalhar: {
    titulo: 'Como esse traço pode atrapalhar',
    hint: 'Um campo de texto para cada contexto (cada um vira um bullet no relatório).',
  },
  exemplosOportunidade: {
    titulo: 'Exemplos de como esse traço pode se tornar uma força em cada um dos âmbitos:',
    hint: 'Um campo de texto para cada contexto (cada um vira um bullet no relatório).',
  },
  exemplosPraticosForca: {
    titulo: 'Exemplos práticos',
    hint: 'Um campo de texto para cada contexto (cada um vira um bullet no relatório).',
  },
  atrapalharFo: {
    titulo: 'Como esse traço atrapalha nos âmbitos',
    hint: 'Um campo de texto para cada contexto (cada um vira um bullet no relatório).',
  },
  comoUsarForca: {
    titulo: 'Como pode ser usado',
    hint: 'Um campo de texto para cada contexto (cada um vira um bullet no relatório).',
  },
}

/** Campos editoriais (tipo e traço são selecionados no topo do formulário). */
export const CAMPOS_RELATORIO_AMEACA = [
  { name: 'oQueE', label: 'O que é', type: 'textArray', split: 'paragraph', required: false },
  ...CATEGORIAS_ATRAPALHAR.map(({ name, label }) => ({
    name,
    label,
    type: 'text',
    required: false,
    group: 'atrapalhar',
  })),
  {
    name: 'reduzirImpacto',
    label: 'Como reduzir o impacto negativo desse traço',
    type: 'textArray',
    split: 'paragraph',
    required: false,
  },
  { name: 'dicas', label: 'Dicas práticas', type: 'bulletList', required: false },
  { name: 'exemplos', label: 'Exemplos práticos', type: 'bulletList', required: false },
]

export const ENDPOINT_TRACO_DETALHE = '/traco-detalhe'

const SECAO_NEUTRO = {
  legend: 'Neutro',
  // hint: 'Sempre exibido, independente do quadrante em que o traço for classificado.',
  badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
}
const SECAO_OPORTUNIDADE = {
  legend: 'Oportunidade',
  // hint: 'Exibido quando o traço cair no quadrante Oportunidades.',
  badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
}
const SECAO_FRAQUEZA = {
  legend: 'Fraqueza',
  // hint: 'Exibido quando o traço cair no quadrante Fraquezas.',
  badgeClass: 'bg-orange-50 text-orange-800 border-orange-200',
}
const SECAO_FORCA = {
  legend: 'Força',
  badgeClass: 'bg-green-50 text-green-800 border-green-200',
}

/** Campos exibidos nos quadrantes Oportunidade e Fraqueza (relatório F). */
const SECOES_FO_FORCA = [SECAO_OPORTUNIDADE, SECAO_FRAQUEZA]

export const CATEGORIAS_COMO_USAR = [
  { name: 'comoUsarAcademico', label: 'Na faculdade' },
  { name: 'comoUsarProfissional', label: 'No trabalho' },
  { name: 'comoUsarCotidiano', label: 'Na vida pessoal' },
]

export const CAMPOS_RELATORIO_FO = [
  { name: 'oQueE', label: 'O que é', type: 'textArray', split: 'paragraph', required: false, section: SECAO_NEUTRO },
  {
    name: 'comoOportunidade',
    label: 'Como esse traço pode ser uma oportunidade de se transformar em força, caso seja trabalhado',
    type: 'textArray',
    split: 'paragraph',
    required: false,
    section: SECAO_OPORTUNIDADE,
  },
  ...CATEGORIAS_EXEMPLOS_OPORTUNIDADE.map(({ name, label }) => ({
    name,
    label,
    type: 'text',
    required: false,
    group: 'exemplosOportunidade',
    section: SECAO_OPORTUNIDADE,
  })),
  {
    name: 'fraquezaOuAmeaca',
    label: 'Como esse traço pode ser uma fraqueza ou ter potencial de ser uma ameaça',
    type: 'textArray',
    split: 'paragraph',
    required: false,
    section: SECAO_FRAQUEZA,
  },
  ...CATEGORIAS_ATRAPALHAR.map(({ name, label }) => ({
    name,
    label,
    type: 'text',
    required: false,
    group: 'atrapalharFo',
    section: SECAO_FRAQUEZA,
  })),
  {
    name: 'dicas',
    label: 'Dicas para reduzir o impacto negativo desse traço ou usá-lo como uma força',
    type: 'bulletList',
    required: false,
    section: SECAO_NEUTRO,
  },
  { name: 'exemplos', label: 'Exemplos práticos', type: 'bulletList', required: false, section: SECAO_NEUTRO },
]

/** @deprecated use CAMPOS_RELATORIO_FO */
export const CAMPOS_RELATORIO_OPORTUNIDADE = CAMPOS_RELATORIO_FO

export const CAMPOS_RELATORIO_FORCA = [
  { name: 'oQueE', label: 'O que é', type: 'textArray', split: 'paragraph', required: false, section: SECAO_NEUTRO },
  ...CATEGORIAS_COMO_USAR.map(({ name, label }) => ({
    name,
    label,
    type: 'text',
    required: false,
    group: 'comoUsarForca',
    section: SECAO_FORCA,
  })),
  {
    name: 'comoOportunidade',
    label: 'Quando e como esse traço pode ser uma oportunidade de se transformar em força, caso seja trabalhado',
    type: 'textArray',
    split: 'paragraph',
    required: false,
    section: SECAO_OPORTUNIDADE,
  },
  ...CATEGORIAS_EXEMPLOS_PRATICOS_FORCA.map(({ name, label }) => ({
    name,
    label,
    type: 'text',
    required: false,
    group: 'exemplosPraticosForca',
    section: SECAO_OPORTUNIDADE,
  })),
  {
    name: 'transformarEmForca',
    label: 'Como transformar em força',
    type: 'bulletList',
    required: false,
    section: SECAO_OPORTUNIDADE,
  },
  {
    name: 'fraquezaOuAmeaca',
    label: 'Quando esse traço é uma fraqueza e como ele pode ser uma oportunidade de se transformar em força',
    type: 'textArray',
    split: 'paragraph',
    required: false,
    section: SECAO_FRAQUEZA,
  },
  {
    name: 'transformarEmOportunidade',
    label: 'Como transformar em oportunidade',
    type: 'bulletList',
    required: false,
    section: SECAO_FRAQUEZA,
  },
  { name: 'exemplos', label: 'Exemplos práticos', type: 'bulletList', required: false, sections: SECOES_FO_FORCA },
]

const TRACO_DETALHE_VAZIO = {
  comoUsarAcademico: '',
  comoUsarProfissional: '',
  comoUsarCotidiano: '',
  comoOportunidade: [],
  exemplosOportunidadeAcademico: '',
  exemplosOportunidadeProfissional: '',
  exemplosOportunidadeFamiliar: '',
  exemplosOportunidadeAmigosColegas: '',
  exemplosOportunidadeParceiros: '',
  exemplosPraticosEstudo: '',
  exemplosPraticosTrabalho: '',
  exemplosPraticosCotidiano: '',
  fraquezaOuAmeaca: [],
  atrapalharAcademico: '',
  atrapalharProfissional: '',
  atrapalharFamiliar: '',
  atrapalharAmigosColegas: '',
  atrapalharParceiros: '',
  transformarEmForca: [],
  transformarEmOportunidade: [],
  reduzirImpacto: [],
  dicas: [],
  exemplos: [],
}

export function montarPayloadTracoDetalhe(tipoBanco, numeroTraco, titulo, camposPayload) {
  return {
    tipo: tipoBanco,
    numeroTraco: Number(numeroTraco),
    titulo,
    oQueE: [],
    ...TRACO_DETALHE_VAZIO,
    ...camposPayload,
  }
}

export const TIPOS_RELATORIOS = [
  {
    key: 'AMEACA',
    label: 'Fraquezas e Ameaças',
    variant: 'ameaca',
    campos: CAMPOS_RELATORIO_AMEACA,
    disponivel: true,
  },
  {
    key: 'OPORTUNIDADE',
    label: 'Fraquezas e Oportunidades',
    variant: 'oportunidade',
    tipoBanco: 'FO',
    endpoint: ENDPOINT_TRACO_DETALHE,
    tracosEndpoint: '/fraquezas-oportunidades',
    campos: CAMPOS_RELATORIO_FO,
    disponivel: true,
  },
  {
    key: 'FORCA',
    label: 'Forças',
    variant: 'forca',
    tipoBanco: 'F',
    endpoint: ENDPOINT_TRACO_DETALHE,
    tracosEndpoint: '/forcas',
    campos: CAMPOS_RELATORIO_FORCA,
    disponivel: true,
  },
]

export function endpointDoRelatorio(relatorio) {
  const tipo = relatorio?.tipoRelatorio ?? 'SH'
  if (tipo === 'FO' || tipo === 'F') return ENDPOINT_TRACO_DETALHE
  return TIPOS_RELATORIO_TRACO[tipo]?.endpoint ?? ENDPOINT_SH
}

export function tituloDoTraco(traco) {
  if (!traco) return ''
  return (traco.swot || traco.pergunta || traco.titulo || '').trim()
}

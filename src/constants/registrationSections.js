/** Espelho de app-autswot/src/constants/registrationSections.js */

export const SIM_NAO = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Não' },
];

export const ACESSO_MEDICACOES = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao_nao_quero', label: 'Não porque não quero tomar todos os remédios' },
  { value: 'nao_sem_recursos', label: 'Não porque não tenho recursos para comprar todos os remédios' },
];

export const TERAPIAS = [
  { value: 'sim_todas_recomendadas', label: 'Sim, faço todas as terapias recomendadas pelos médicos' },
  { value: 'sim_parcialmente_tempo', label: 'Sim, mas faço parcialmente as terapias recomendadas pelos médicos por falta de tempo' },
  { value: 'sim_parcialmente_dinheiro', label: 'Sim, mas faço parcialmente as terapias recomendadas pelos médicos por falta de dinheiro' },
  { value: 'nao_nao_quero', label: 'Não faço porque não quero' },
  { value: 'nao_sem_dinheiro', label: 'Não faço porque não tenho dinheiro' },
];

export const COR_RACA = [
  { value: 'preto', label: 'Preto' },
  { value: 'pardo', label: 'Pardo' },
  { value: 'branca', label: 'Branca' },
  { value: 'amarela', label: 'Amarela' },
];

export const GENERO = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'outro', label: 'Outro (especifique abaixo)' },
  { value: 'prefiro_nao_dizer', label: 'Prefiro não dizer' },
];

export const ESCOLARIDADE = [
  { value: 'ensino_basico_1_4', label: 'Ensino básico (1ª a 4ª série)' },
  { value: 'ensino_fundamental_5_9', label: 'Ensino fundamental (5ª a 9ª série)' },
  { value: 'ensino_medio', label: 'Ensino médio (colegial)' },
  { value: 'graduacao_curso_ou_completa', label: 'Graduação completa ou em curso' },
  { value: 'pos_graduacao_curso_ou_completa', label: 'Pós-graduação completa ou em curso' },
];

export const COM_QUEM_MORA = [
  { value: 'sozinho', label: 'Sozinho' },
  { value: 'pais_parentes', label: 'Com meus pais, irmãos ou outros parentes' },
  { value: 'amigos_colegas', label: 'Com amigos ou colegas' },
  { value: 'parceiro_romantico', label: 'Com meu parceiro romântico (namorado(a); noivo(a); esposo(a); companheiro(a))' },
];

export const SITUACAO_TRABALHO = [
  { value: 'clt', label: 'Sim, trabalho CLT' },
  { value: 'autonomo_empreendedor', label: 'Sim, sou autônomo ou empreendedor' },
  { value: 'nao', label: 'Não' },
];

export const NIVEL_RENDA = [
  { value: 'sem_renda', label: 'No momento não possuo renda' },
  { value: 'bolsa_familia_bpc', label: 'No momento recebo Bolsa Família ou BPC-LOAS' },
  { value: 'ate_1_sm', label: 'Até 1 salário mínimo (R$ 1627)' },
  { value: 'ate_2_sm', label: 'Até 2 salários mínimos (R$ 3254)' },
  { value: 'ate_3_sm', label: 'Até 3 salários mínimos (R$ 4881)' },
  { value: 'mais_3_sm', label: 'Mais do que 3 salários mínimos (R$ 4881)' },
];

export const PENSAMENTOS_SUICIDIO = [
  { value: 'nunca', label: 'Nunca' },
  { value: 'pensamento_breve', label: 'Tive apenas um pensamento, e foi breve' },
  { value: 'plano_sem_tentativa', label: 'Ao menos uma vez, já cheguei até a fazer um plano, mas não tentei executá-lo' },
  { value: 'plano_pensou_executar', label: 'Ao menos uma vez, já cheguei a planejar e nessa ocasião eu pensei em morrer executando o plano' },
  { value: 'tentativa_parar_dor', label: 'Já tentei me suicidar, mas não porque eu queria de fato morrer e sim porque eu queria parar de sentir dor' },
  { value: 'tentativa_queria_morrer', label: 'Já tentei me suicidar e nessa ocasião eu realmente queria morrer' },
];

export const FREQUENCIA_SUICIDIO_12M = [
  { value: 'nunca', label: 'Nunca' },
  { value: 'raramente', label: 'Raramente' },
  { value: 'as_vezes', label: 'Às vezes' },
  { value: 'frequentemente', label: 'Frequentemente' },
  { value: 'muito_frequentemente', label: 'Muito frequentemente' },
];

export const REGISTRATION_SECTIONS = [
  {
    title: 'Indicação e saúde',
    fields: [
      { key: 'especialistaIndicacao', label: 'Nome do especialista/pesquisador que indicou', type: 'text' },
      { key: 'diagnosticadoTea', label: 'Diagnosticado com TEA?', options: SIM_NAO },
      { key: 'outrasCondicoesSaude', label: 'Outras condições de saúde?', options: SIM_NAO },
      { key: 'outrasCondicoesDetalhe', label: 'Outras condições (detalhe)', type: 'text', showIf: (d) => d?.outrasCondicoesSaude === 'sim' },
      { key: 'acessoMedicacoes', label: 'Acesso a medicações', options: ACESSO_MEDICACOES },
      { key: 'terapiasNaoMedicamentosas', label: 'Terapias não medicamentosas', options: TERAPIAS },
    ],
  },
  {
    title: 'Dados pessoais',
    fields: [
      { key: 'idade', label: 'Idade', type: 'text' },
      { key: 'corRaca', label: 'Cor/raça', options: COR_RACA },
      { key: 'genero', label: 'Gênero', options: GENERO },
      { key: 'generoOutroTexto', label: 'Gênero (especificação)', type: 'text', showIf: (d) => d?.genero === 'outro' },
      { key: 'profissao', label: 'Profissão', type: 'text' },
      { key: 'escolaridade', label: 'Escolaridade', options: ESCOLARIDADE },
    ],
  },
  {
    title: 'Moradia, trabalho e renda',
    fields: [
      { key: 'comQuemMora', label: 'Com quem mora', options: COM_QUEM_MORA },
      { key: 'situacaoTrabalho', label: 'Situação de trabalho', options: SITUACAO_TRABALHO },
      { key: 'auxilioGovernoExperiencia', label: 'Experiência com auxílio do governo', type: 'text' },
      { key: 'nivelRenda', label: 'Nível de renda', options: NIVEL_RENDA },
    ],
  },
  {
    title: 'Saúde mental e bem-estar',
    fields: [
      { key: 'burnout', label: 'Burnout', options: SIM_NAO },
      { key: 'burnoutDescricao', label: 'Descrição do burnout', type: 'text', showIf: (d) => d?.burnout === 'sim' },
      { key: 'pensamentosSuicidio', label: 'Pensamentos relacionados a suicídio', options: PENSAMENTOS_SUICIDIO },
      { key: 'frequenciaSuicidio12meses', label: 'Frequência nos últimos 12 meses', options: FREQUENCIA_SUICIDIO_12M },
      { key: 'contouSuicidioOuBarreiras', label: 'Contou a alguém / barreiras', type: 'text' },
      { key: 'probabilidadeSuicidioFuturoExplicacao', label: 'Probabilidade futura', type: 'text' },
    ],
  },
];

export function formatRegistrationAnswer(field, value) {
  if (value == null || String(value).trim() === '') return '—';
  if (field.options) {
    return field.options.find((o) => o.value === value)?.label ?? String(value);
  }
  return String(value);
}

export function getVisibleRegistrationFields(registration) {
  if (!registration) return [];
  return REGISTRATION_SECTIONS.map((section) => ({
    ...section,
    fields: section.fields.filter((field) => !field.showIf || field.showIf(registration)),
  })).filter((section) => section.fields.length > 0);
}

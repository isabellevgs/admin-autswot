/** Títulos e textos fixos para renderização PDF no admin. */

export const TITULOS_FO = {
  oQueE: 'O que é',
  comoOportunidade:
    'Como esse traço pode ser uma oportunidade de se transformar em força, caso seja trabalhado',
  exemplosOportunidade: 'Exemplos de como esse traço pode se tornar uma força em cada um dos âmbitos:',
  fraquezaOuAmeaca:
    'Como esse traço pode ser uma fraqueza ou ter potencial de ser uma ameaça',
  comoAtrapalhar: 'Como esse traço atrapalha nos âmbitos',
  dicas: 'Dicas para reduzir o impacto negativo desse traço ou usá-lo como uma força',
  exemplos: 'Exemplos práticos',
};

export const TITULOS_FORCA = {
  oQueE: 'O que é',
  comoUsar: 'Como pode ser usado',
  comoOportunidade:
    'Quando e como esse traço pode ser uma oportunidade de se transformar em força, caso seja trabalhado',
  exemplosPraticos: 'Exemplos práticos',
  fraquezaOuOportunidade:
    'Quando esse traço é uma fraqueza e como ele pode ser uma oportunidade de se transformar em força',
  transformarEmForca: 'Como transformar em força',
  transformarEmOportunidade: 'Como transformar em oportunidade',
};

export const TITULO_EXERCICIOS =
  'Exercícios de autoconhecimento e delineamento de estratégias.';

export const INTRO_EXERCICIOS_POR_QUADRANTE = {
  ameaca:
    'Responda as questões abaixo para descobrir como esse traço impacta negativamente na sua vida e o que pode ser feito para reduzir ou evitar tal impacto.',
  fraqueza:
    'Responda as questões abaixo para descobrir como esse traço impacta negativamente na sua vida e o que pode ser feito para reduzir ou evitar tal impacto.',
  oportunidade:
    'Responda as questões abaixo para descobrir como esse traço pode se tornar uma força caso seja trabalhado.',
  forca: null,
};

export function introExercicios(quadrante) {
  return INTRO_EXERCICIOS_POR_QUADRANTE[quadrante] ?? null;
}

const PERGUNTAS_IDS = {
  ameaca: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'],
  fraqueza: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'],
  oportunidade: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'],
  forca: [],
};

export function questoesDoQuadrante(quadrante) {
  return (PERGUNTAS_IDS[quadrante] ?? []).map((id) => ({ id }));
}

export const PERGUNTAS_TEXTO_AMEACA_FRAQUEZA = [
  'Quando e como foi a última vez que você se lembra deste traço sendo manifestado? Em que momento esse traço dificultou algo na sua rotina, estudos, trabalho ou relacionamentos?',
  'Quais foram as consequências negativas ou positivas dessa situação e como você se sentiu? Impactou prazos, relacionamentos, sua saúde mental?',
  'O que você pode fazer para evitar que esse traço se manifeste ou para reduzir o impacto negativo dele?',
  'O que as outras pessoas (professores, chefes, colegas, familiares, amigos, parceiros) podem fazer para te dar apoio e suporte?',
  'Qual é a sua necessidade específica de apoio ou suporte referente a esse traço?',
  'O que você pode fazer, somado ao que os outros podem fazer, é suficiente? Se não for, liste o que mais seria necessário e que recursos você necessita.',
  'Como você pode conseguir as coisas citadas na questão acima? Liste e explique.',
];

export const PERGUNTAS_TEXTO_OPORTUNIDADE = [
  'Quando e como foi a última vez que você se lembra deste traço sendo manifestado de forma positiva ou negativa?',
  'Quais foram as consequências negativas ou positivas dessa situação e como você se sentiu?',
  'Se esse traço for trabalhado, que benefícios ele poderia trazer para sua vida? Qual é o potencial positivo escondido por trás da dificuldade?',
  'Que tipo de apoio, estrutura ou suporte você precisaria para transformar esse traço em algo positivo na sua vida?',
  'O que você pode começar a fazer para transformar esse traço em uma força? Liste atitudes, hábitos, pequenas mudanças que dependem de você.',
  'O que as outras pessoas podem fazer para te dar apoio e suporte?',
  'O que você pode fazer somado ao que os outros podem fazer é suficiente? Que recursos você precisa?',
  'Como você pode conseguir as coisas citadas na questão acima? Liste e explique.',
];

export const PERGUNTAS_TEXTO_POR_QUADRANTE = {
  ameaca: PERGUNTAS_TEXTO_AMEACA_FRAQUEZA,
  fraqueza: PERGUNTAS_TEXTO_AMEACA_FRAQUEZA,
  oportunidade: PERGUNTAS_TEXTO_OPORTUNIDADE,
  forca: [],
};

export function textosPerguntasQuadrante(quadrante) {
  return PERGUNTAS_TEXTO_POR_QUADRANTE[quadrante] ?? [];
}

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

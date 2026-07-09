import {
  montarItensAtrapalhar,
  montarComoUsar,
  montarExemplosOportunidade,
  montarExemplosPraticosForca,
} from '@/constants/relatorioSh'
import {
  TITULOS_FO,
  TITULOS_FORCA,
  TITULO_EXERCICIOS,
  introExercicios,
  questoesDoQuadrante,
  textosPerguntasQuadrante,
} from '@/constants/swot-pdf-textos'
import {
  TYPE,
  splitLines,
  textBlockHeight,
  ensureSpace,
  drawLinesLeft,
} from '@/lib/swot-pdf-typography'

const { margin: MARGIN, contentWidth: CONTENT_W, spacing: SP, sizes: SZ, colors: C } = TYPE

const SECOES = [
  { key: 'ameacas',      quadrante: 'ameaca',      titulo: 'Ameaças',       r: 239, g: 68,  b: 68  },
  { key: 'fraquezas',    quadrante: 'fraqueza',    titulo: 'Fraquezas',      r: 249, g: 115, b: 22  },
  { key: 'oportunidades',quadrante: 'oportunidade',titulo: 'Oportunidades',  r: 59,  g: 130, b: 246 },
  { key: 'forcas',       quadrante: 'forca',       titulo: 'Forças',         r: 34,  g: 197, b: 94  },
]

const PERGUNTAS_TEXTO = {
  ameaca: textosPerguntasQuadrante('ameaca'),
  fraqueza: textosPerguntasQuadrante('fraqueza'),
  oportunidade: textosPerguntasQuadrante('oportunidade'),
  forca: [],
}

function perguntasDoQuadrantePdf(quadrante) {
  const qs = questoesDoQuadrante(quadrante)
  const textos = PERGUNTAS_TEXTO[quadrante] ?? []
  return qs.map((q, i) => ({ id: q.id, texto: textos[i] ?? q.id }))
}

function setTextColor(doc, [r, g, b]) {
  doc.setTextColor(r, g, b)
}

function writeHeading(doc, text, y) {
  const size = SZ.heading
  const lines = splitLines(doc, text, CONTENT_W, size)
  const lh = TYPE.lineHeight(size)
  y = ensureSpace(doc, y, lines.length * lh + SP.afterHeading)
  doc.setFontSize(size)
  doc.setFont('helvetica', 'bold')
  setTextColor(doc, C.text)
  return drawLinesLeft(doc, lines, MARGIN, y, size) + SP.afterHeading
}

function writeSubheading(doc, text, y) {
  const size = SZ.subheading
  const lines = splitLines(doc, text, CONTENT_W, size)
  const lh = TYPE.lineHeight(size)
  y = ensureSpace(doc, y, lines.length * lh + SP.afterSubheading)
  doc.setFontSize(size)
  doc.setFont('helvetica', 'bold')
  setTextColor(doc, C.textMuted)
  return drawLinesLeft(doc, lines, MARGIN, y, size) + SP.afterSubheading
}

function writeParagraph(doc, text, y) {
  if (!text?.trim()) return y
  const size = SZ.body
  const lines = splitLines(doc, text, CONTENT_W, size)
  const lh = TYPE.lineHeight(size)
  y = ensureSpace(doc, y, lines.length * lh + SP.afterParagraph)
  doc.setFontSize(size)
  doc.setFont('helvetica', 'normal')
  setTextColor(doc, C.text)
  return drawLinesLeft(doc, lines, MARGIN, y, size) + SP.afterParagraph
}

function writeBulletList(doc, items, y) {
  if (!items?.length) return y
  const size = SZ.bullet
  const lh = TYPE.lineHeight(size)
  doc.setFontSize(size)
  doc.setFont('helvetica', 'normal')
  setTextColor(doc, C.text)
  for (const item of items) {
    const lines = splitLines(doc, `• ${item}`, CONTENT_W - 4, size)
    y = ensureSpace(doc, y, lines.length * lh + SP.afterBulletItem)
    y = drawLinesLeft(doc, lines, MARGIN + 2, y, size)
    y += SP.afterBulletItem
  }
  return y
}

function writeResposta(doc, resposta, y) {
  const size = SZ.body
  const texto = resposta?.trim() ?? ''
  const pad = SP.answerPadding
  const minH = SP.answerMinHeight

  doc.setDrawColor(...C.border)
  doc.setLineWidth(0.35)

  if (texto) {
    const lines = splitLines(doc, texto, CONTENT_W - pad * 2, size)
    const boxH = Math.max(minH, textBlockHeight(lines.length, size, pad * 2))
    y = ensureSpace(doc, y, boxH + 2)
    doc.setFillColor(...C.answerBg)
    doc.roundedRect(MARGIN, y, CONTENT_W, boxH, 2, 2, 'FD')
    doc.setFontSize(size)
    doc.setFont('helvetica', 'normal')
    setTextColor(doc, C.text)
    drawLinesLeft(doc, lines, MARGIN + pad, y + pad, size)
    return y + boxH + 2
  }

  y = ensureSpace(doc, y, minH + 2)
  doc.roundedRect(MARGIN, y, CONTENT_W, minH, 2, 2, 'S')
  return y + minH + 2
}

function renderDetalheShCh(doc, detalhe, quadrante, y) {
  const isAmeacaFraqueza = quadrante === 'ameaca' || quadrante === 'fraqueza'
  if (!isAmeacaFraqueza) return y

  const atrapalhar = montarItensAtrapalhar(detalhe)
  const reduzir = detalhe.reduzirImpacto ?? []
  const dicas = detalhe.dicas ?? []
  const exemplos = detalhe.exemplos ?? []

  if (atrapalhar.length) {
    y = writeSubheading(doc, 'Como esse traço pode atrapalhar', y)
    y = writeBulletList(doc, atrapalhar, y)
  }
  if (reduzir.length) {
    y = writeSubheading(doc, 'Como reduzir o impacto negativo desse traço', y)
    for (const p of reduzir) y = writeParagraph(doc, p, y)
  }
  if (dicas.length) {
    y = writeSubheading(doc, 'Dicas práticas', y)
    y = writeBulletList(doc, dicas, y)
  }
  if (exemplos.length) {
    y = writeSubheading(doc, 'Exemplos práticos', y)
    y = writeBulletList(doc, exemplos, y)
  }
  return y
}

function renderDetalheFo(doc, detalhe, quadrante, tipo, y) {
  const isFo = tipo === 'FO'
  const isF = tipo === 'F'
  const mostrarOportunidade = quadrante === 'oportunidade'
  const mostrarFraqueza = quadrante === 'fraqueza'

  const oport = detalhe.comoOportunidade ?? []
  const exemplosOport = isF ? montarExemplosPraticosForca(detalhe) : montarExemplosOportunidade(detalhe)
  const fraquezaOuAmeaca = detalhe.fraquezaOuAmeaca ?? []
  const atrapalhar = montarItensAtrapalhar(detalhe)
  const transformarEmForca = detalhe.transformarEmForca ?? []
  const transformarEmOportunidade = detalhe.transformarEmOportunidade ?? []
  const dicas = !isF ? (detalhe.dicas ?? []) : []
  const exemplosPraticos = detalhe.exemplos ?? []

  if (mostrarOportunidade && oport.length) {
    const titulo = isF ? TITULOS_FORCA.comoOportunidade : TITULOS_FO.comoOportunidade
    y = writeSubheading(doc, titulo, y)
    for (const p of oport) y = writeParagraph(doc, p, y)
  }
  if (mostrarOportunidade && exemplosOport.length) {
    const titulo = isF ? TITULOS_FORCA.exemplosPraticos : TITULOS_FO.exemplosOportunidade
    y = writeSubheading(doc, titulo, y)
    y = writeBulletList(doc, exemplosOport, y)
  }
  if (mostrarOportunidade && isF && transformarEmForca.length) {
    y = writeSubheading(doc, TITULOS_FORCA.transformarEmForca, y)
    y = writeBulletList(doc, transformarEmForca, y)
  }
  if (mostrarFraqueza && fraquezaOuAmeaca.length) {
    const titulo = isF ? TITULOS_FORCA.fraquezaOuOportunidade : TITULOS_FO.fraquezaOuAmeaca
    y = writeSubheading(doc, titulo, y)
    for (const p of fraquezaOuAmeaca) y = writeParagraph(doc, p, y)
  }
  if (mostrarFraqueza && isF && transformarEmOportunidade.length) {
    y = writeSubheading(doc, TITULOS_FORCA.transformarEmOportunidade, y)
    y = writeBulletList(doc, transformarEmOportunidade, y)
  }
  if (mostrarFraqueza && !isF && atrapalhar.length) {
    y = writeSubheading(doc, TITULOS_FO.comoAtrapalhar, y)
    y = writeBulletList(doc, atrapalhar, y)
  }
  if (dicas.length) {
    y = writeSubheading(doc, TITULOS_FO.dicas, y)
    y = writeBulletList(doc, dicas, y)
  }
  const mostrarExemplosLegado =
    exemplosPraticos.length &&
    (!isF || !mostrarOportunidade || !exemplosOport.length)
  if (((isF && (mostrarOportunidade || mostrarFraqueza)) || !isF) && mostrarExemplosLegado) {
    const titulo = isF ? TITULOS_FORCA.exemplosPraticos : TITULOS_FO.exemplos
    y = writeSubheading(doc, titulo, y)
    y = writeBulletList(doc, exemplosPraticos, y)
  }
  return y
}

function renderDetalheForca(doc, detalhe, y) {
  const usar = montarComoUsar(detalhe)
  if (usar.length) {
    y = writeSubheading(doc, TITULOS_FORCA.comoUsar, y)
    y = writeBulletList(doc, usar, y)
  }
  return y
}

function writeQuadranteHeader(doc, secao, y) {
  const bandH = 9
  y = ensureSpace(doc, y, bandH + SP.afterQuadrantBand)
  doc.setFillColor(secao.r, secao.g, secao.b)
  doc.roundedRect(MARGIN, y, CONTENT_W, bandH, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(SZ.quadrantBand)
  doc.setFont('helvetica', 'bold')
  doc.text(secao.titulo, MARGIN + 4, y + 6.5)
  return y + bandH + SP.afterQuadrantBand
}

function writeTracoTitulo(doc, label, y) {
  const size = SZ.tracoTitle
  const texto = `Traço: ${label}`
  const lines = splitLines(doc, texto, CONTENT_W, size)
  y = ensureSpace(doc, y, lines.length * TYPE.lineHeight(size) + SP.afterTracoTitle)
  doc.setFontSize(size)
  doc.setFont('helvetica', 'bold')
  setTextColor(doc, C.tracoTitle)
  return drawLinesLeft(doc, lines, MARGIN, y, size) + SP.afterTracoTitle
}

function renderTracoConteudo(doc, traco, y) {
  const { label, tipo, quadrante, detalhe, respostas } = traco
  const isFo = tipo === 'FO'
  const isF = tipo === 'F'
  const isShCh = tipo === 'SH' || tipo === 'CH'

  y = writeTracoTitulo(doc, label, y)

  if (!detalhe) {
    y = writeParagraph(doc, 'As informações detalhadas deste traço ainda não foram cadastradas.', y)
  } else {
    const oQueE = detalhe.oQueE ?? []
    if (oQueE.length) {
      const tituloOQue = isFo || isF ? TITULOS_FO.oQueE : 'O que é'
      y = writeHeading(doc, tituloOQue, y)
      for (const p of oQueE) y = writeParagraph(doc, p, y)
    }

    if (isF) y = renderDetalheForca(doc, detalhe, y)

    if (isFo || (isF && quadrante !== 'forca')) {
      y = renderDetalheFo(doc, detalhe, quadrante, tipo, y)
    }

    if (isShCh) y = renderDetalheShCh(doc, detalhe, quadrante, y)
  }

  const intro = introExercicios(quadrante)
  const perguntas = perguntasDoQuadrantePdf(quadrante)

  if (perguntas.length && intro) {
    y = writeHeading(doc, TITULO_EXERCICIOS, y)
    y = writeParagraph(doc, intro, y)

    perguntas.forEach(({ id, texto }, idx) => {
      y = writeSubheading(doc, `${idx + 1}) ${texto}`, y)
      y = writeResposta(doc, respostas[id] ?? '', y)
    })
  }

  return y + SP.afterTraco
}

const AVISO_SEM_TRACOS = 'Nenhum traço neste quadrante (0 traços).'

export function renderTracosNoPdf(doc, tracos) {
  doc.addPage()
  let y = MARGIN

  doc.setFillColor(109, 40, 217)
  doc.rect(0, 0, 210, 20, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(SZ.sectionDivider)
  doc.setFont('helvetica', 'bold')
  doc.text('Detalhamento dos traços', MARGIN, 13)
  y = 24

  for (const secao of SECOES) {
    const tracosSecao = (tracos ?? []).filter((t) => t.quadrante === secao.quadrante)

    y = writeQuadranteHeader(doc, secao, y)

    if (!tracosSecao.length) {
      y = writeParagraph(doc, AVISO_SEM_TRACOS, y)
    } else {
      for (const traco of tracosSecao) {
        y = renderTracoConteudo(doc, traco, y)
      }
    }

    y += SP.afterQuadrant
  }
}

export { TYPE, splitLines, textBlockHeight, ensureSpace, drawLinesLeft, SECOES }

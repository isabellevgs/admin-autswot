/** Escala tipográfica compartilhada entre swot-pdf.js e swot-pdf-tracos.js */

export const PAGE_W = 210
const PT_TO_MM = 25.4 / 72
export const LINE_SPACING = 1.5

export const TYPE = {
  margin: 18,
  pageBottom: 288,
  contentWidth: PAGE_W - 18 * 2,

  /** Altura de linha com espaçamento 1,5 (pt → mm). */
  lineHeight(size) {
    return size * LINE_SPACING * PT_TO_MM
  },

  sizes: {
    docTitle: 20,
    docSubtitle: 11,
    sectionDivider: 17,
    quadrantBand: 12,
    tracoTitle: 15,
    heading: 12,
    subheading: 11,
    body: 10.5,
    bullet: 10.5,
    footer: 9,
  },

  colors: {
    text: [32, 32, 42],
    textMuted: [72, 72, 82],
    tracoTitle: [109, 40, 217],
    border: [210, 212, 220],
    answerBg: [252, 252, 254],
    zebra: [248, 249, 252],
  },

  spacing: {
    afterQuadrantBand: 1.5,
    afterTracoTitle: 1.5,
    afterHeading: 1.5,
    afterSubheading: 1.5,
    afterParagraph: 1.5,
    afterBulletItem: 1.5,
    afterTraco: 1.5,
    afterQuadrant: 1.5,
    answerPadding: 3,
    answerMinHeight: 36,
  },
}

/** Remove espaços extras, NBSP e quebras do texto cadastrado no admin. */
export function normalizeText(text) {
  return String(text ?? '')
    .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim()
}

export function splitLines(doc, text, maxWidth, fontSize) {
  doc.setFontSize(fontSize)
  const normalized = normalizeText(text)
  if (!normalized) return []
  return doc.splitTextToSize(normalized, maxWidth)
}

/** Desenha linhas sempre alinhadas à esquerda (evita efeito de “justificado”). */
export function drawLinesLeft(doc, lines, x, y, fontSize) {
  const lh = TYPE.lineHeight(fontSize)
  let drawn = 0
  for (const line of lines) {
    const text = line.trim()
    if (!text) continue
    doc.text(text, x, y + drawn * lh, { align: 'left', baseline: 'top' })
    drawn += 1
  }
  return y + drawn * lh
}

export function textBlockHeight(numLines, fontSize, extra = 0) {
  return numLines * TYPE.lineHeight(fontSize) + extra
}

export function ensureSpace(doc, y, needed, margin = TYPE.margin) {
  if (y + needed > TYPE.pageBottom) {
    doc.addPage()
    return margin
  }
  return y
}

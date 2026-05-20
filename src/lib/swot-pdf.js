import { jsPDF } from 'jspdf'

const SECOES = [
  { key: 'ameacas',      titulo: 'Ameaças',       r: 239, g: 68,  b: 68  },
  { key: 'fraquezas',    titulo: 'Fraquezas',      r: 249, g: 115, b: 22  },
  { key: 'oportunidades',titulo: 'Oportunidades',  r: 59,  g: 130, b: 246 },
  { key: 'forcas',       titulo: 'Forças',         r: 34,  g: 197, b: 94  },
]

const PAGE_W  = 210   // A4 largura mm
const MARGIN  = 16
const CONTENT_W = PAGE_W - MARGIN * 2

/**
 * Quebra texto longo em linhas que cabem na largura dada
 */
function splitText(doc, text, maxWidth) {
  return doc.splitTextToSize(text, maxWidth)
}

/**
 * Gera e faz download do PDF SWOT de um usuário
 * @param {string} personName
 * @param {object} swotData  — { ameacas, fraquezas, oportunidades, forcas: { items: string[] } }
 */
export function gerarSwotPdf(personName, swotData) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const date = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  let y = MARGIN

  // ── Cabeçalho ─────────────────────────────────────────────────────────────
  doc.setFillColor(109, 40, 217)           // violeta
  doc.rect(0, 0, PAGE_W, 28, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Análise SWOT', MARGIN, 12)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(personName, MARGIN, 20)
  doc.text(date, PAGE_W - MARGIN, 20, { align: 'right' })

  y = 36

  // ── Seções SWOT ───────────────────────────────────────────────────────────
  for (const secao of SECOES) {
    const items = swotData[secao.key]?.items ?? []
    if (items.length === 0) continue

    // Estima altura do bloco para decidir se quebra página
    const linesPerItem = items.map((item) => splitText(doc, `• ${item}`, CONTENT_W - 6).length)
    const totalLines = linesPerItem.reduce((a, b) => a + b, 0)
    const blockH = 10 + totalLines * 5.5 + items.length * 1.5 + 6

    if (y + blockH > 280) {
      doc.addPage()
      y = MARGIN
    }

    // Faixa colorida com título
    doc.setFillColor(secao.r, secao.g, secao.b)
    doc.roundedRect(MARGIN, y, CONTENT_W, 10, 2, 2, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(`${secao.titulo}  (${items.length} ${items.length === 1 ? 'item' : 'itens'})`, MARGIN + 4, y + 6.8)

    y += 13

    // Itens
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)

    items.forEach((item, i) => {
      const lines = splitText(doc, `• ${item}`, CONTENT_W - 6)
      const itemH = lines.length * 5.5 + 2

      // Fundo zebrado leve
      if (i % 2 === 0) {
        doc.setFillColor(248, 248, 252)
        doc.rect(MARGIN, y - 1, CONTENT_W, itemH, 'F')
      }

      doc.setTextColor(30, 30, 40)
      doc.text(lines, MARGIN + 4, y + 4)
      y += itemH + 1.5
    })

    y += 6  // espaço entre seções
  }

  // ── Rodapé ────────────────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages()
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p)
    doc.setFontSize(8)
    doc.setTextColor(160, 160, 160)
    doc.text(`Página ${p} de ${pageCount}`, PAGE_W / 2, 292, { align: 'center' })
  }

  const filename = `swot-${personName.toLowerCase().replace(/\s+/g, '-')}.pdf`
  doc.save(filename)
}

import { jsPDF } from 'jspdf'
import { renderTracosNoPdf, TYPE, splitLines, textBlockHeight, ensureSpace, drawLinesLeft, SECOES } from '@/lib/swot-pdf-tracos'
import capaLogoBase64 from '../assets/AutSwotCapaPDF.png?inline'

const PAGE_W = TYPE.margin * 2 + TYPE.contentWidth
const { margin: MARGIN, contentWidth: CONTENT_W, sizes: SZ, colors: C, spacing: SP } = TYPE

function itemLabel(item) {
  if (typeof item === 'object' && item !== null) {
    return item.label ?? String(item)
  }
  return String(item)
}

function renderCapa(doc) {
  const imgProps = doc.getImageProperties(capaLogoBase64)
  const aspectRatio = imgProps.height / imgProps.width

  const imagemLargura = 125 
  const imagemAltura = imagemLargura * aspectRatio 

  const x = (PAGE_W - imagemLargura) / 2
  let y = 70

  doc.addImage(capaLogoBase64, 'PNG', x, y, imagemLargura, imagemAltura)
  y += imagemAltura + 10

  doc.setFont('times', 'bold')
  doc.setFontSize(SZ.docTitle + 6)
  doc.setTextColor(21, 96, 130) 
  doc.text('Relatório de perfil autístico', PAGE_W / 2, y, { align: 'center' })
}

export function gerarSwotPdf(personName, swotData, tracosDetalhados = []) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const date = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  renderCapa(doc)
  doc.addPage()

  let y = MARGIN

  doc.setFillColor(109, 40, 217)
  doc.rect(0, 0, PAGE_W, 32, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(SZ.docTitle)
  doc.setFont('helvetica', 'bold')
  doc.text('Análise SWOT', MARGIN, 15)

  doc.setFontSize(SZ.docSubtitle)
  doc.setFont('helvetica', 'normal')
  doc.text(personName, MARGIN, 24)
  doc.text(date, PAGE_W - MARGIN, 24, { align: 'right' })

  y = 40

  const avisoSemTracos = 'Nenhum traço neste quadrante (0 traços).'

  for (const secao of SECOES) {
    const items = (swotData[secao.key]?.items ?? []).map(itemLabel).filter(Boolean)

    const bandH = 9
    const itemSize = SZ.body
    const lh = TYPE.lineHeight(itemSize)
    const linesPerItem = items.map((item) =>
      splitLines(doc, `• ${item}`, CONTENT_W - 6, itemSize).length,
    )
    const avisoLines = items.length === 0
      ? splitLines(doc, avisoSemTracos, CONTENT_W - 6, itemSize).length
      : 0
    const totalLines = items.length === 0
      ? avisoLines
      : linesPerItem.reduce((a, b) => a + b, 0)
    const blockH =
      bandH +
      SP.afterQuadrantBand +
      totalLines * lh +
      SP.afterQuadrant

    y = ensureSpace(doc, y, blockH)

    doc.setFillColor(secao.r, secao.g, secao.b)
    doc.roundedRect(MARGIN, y, CONTENT_W, bandH, 2, 2, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(SZ.quadrantBand)
    doc.setFont('helvetica', 'bold')
    doc.text(
      `${secao.titulo}  (${items.length} ${items.length === 1 ? 'traço' : 'traços'})`,
      MARGIN + 4,
      y + 6.5,
    )

    y += bandH + SP.afterQuadrantBand

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(itemSize)
    doc.setTextColor(...C.text)

    if (items.length === 0) {
      const lines = splitLines(doc, avisoSemTracos, CONTENT_W - 6, itemSize)
      drawLinesLeft(doc, lines, MARGIN + 2, y, itemSize)
      y += lines.length * lh
    } else {
      items.forEach((item, i) => {
        const lines = splitLines(doc, `• ${item}`, CONTENT_W - 6, itemSize)
        const itemH = lines.length * lh

        if (i % 2 === 0) {
          doc.setFillColor(...C.zebra)
          doc.rect(MARGIN, y, CONTENT_W, itemH, 'F')
        }

        drawLinesLeft(doc, lines, MARGIN + 2, y, itemSize)
        y += itemH
      })
    }

    y += SP.afterQuadrant
  }

  renderTracosNoPdf(doc, tracosDetalhados)

  const pageCount = doc.getNumberOfPages()
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p)
    doc.setFontSize(SZ.footer)
    doc.setTextColor(150, 150, 158)
    doc.text(`Página ${p} de ${pageCount}`, PAGE_W / 2, 290, { align: 'center' })
  }

  const filename = `swot-${personName.toLowerCase().replace(/\s+/g, '-')}.pdf`
  doc.save(filename)
}

import { jsPDF } from 'jspdf'
import { TYPE } from '@/lib/swot-pdf-tracos'

const PAGE_W = TYPE.margin * 2 + TYPE.contentWidth
const { margin: MARGIN, contentWidth: CONTENT_W, sizes: SZ, colors: C } = TYPE

function formatData(data) {
  if (!data) return '-'
  return new Date(data).toLocaleDateString('pt-BR')
}

function formatDiagnostico(valor) {
  if (valor === 'sim') return 'Sim'
  if (valor === 'nao') return 'Não'
  return '-'
}

export function gerarPessoasAceitePdf(pessoas) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const date = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  let y = MARGIN
  doc.setFillColor(109, 40, 217)
  doc.rect(0, 0, PAGE_W, 32, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(SZ.docTitle)
  doc.setFont('helvetica', 'bold')
  doc.text('Pessoas com Aceite', MARGIN, 15)
  doc.setFontSize(SZ.docSubtitle)
  doc.setFont('helvetica', 'normal')
  doc.text(`Total: ${pessoas.length}`, MARGIN, 24)
  doc.text(date, PAGE_W - MARGIN, 24, { align: 'right' })

  y = 40
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(SZ.body)
  doc.setTextColor(...C.text)

  pessoas.forEach((p, i) => {
    const reg = p.profileRegistration ?? {}
    const dataAceite = formatData(p.createdAt)
    const diagnosticoTea = formatDiagnostico(reg.diagnosticadoTea)
    const profissionalIndicou = reg.especialistaIndicacao || '-'

    const linhaH = 24
    if (y + linhaH > 270) {
      doc.addPage()
      y = MARGIN
    }

    if (i % 2 === 0) {
      doc.setFillColor(...C.zebra)
      doc.rect(MARGIN, y, CONTENT_W, linhaH, 'F')
    }

    doc.setFont('helvetica', 'bold')
    doc.text(p.name ?? '-', MARGIN + 2, y + 6)

    doc.setFont('helvetica', 'normal')
    doc.text(`Data do aceite: ${dataAceite}`, MARGIN + 2, y + 12)
    doc.text(`Diagnóstico formal de TEA: ${diagnosticoTea}`, MARGIN + 2, y + 18)
    doc.text(`Profissional que indicou: ${profissionalIndicou}`, MARGIN + 2, y + 24)

    y += linhaH + 4
  })

  doc.save(`pessoas-aceite-${Date.now()}.pdf`)
}

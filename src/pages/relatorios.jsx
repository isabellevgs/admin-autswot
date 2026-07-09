import { useState } from 'react'
import PerguntasFolderTabs from '@/components/perguntas-folder-tabs'
import RelatorioTipoPanel from '@/components/relatorio-tipo-panel'
import { TIPOS_RELATORIOS } from '@/constants/relatorios-config'

function Relatorios() {
  const [activeTab, setActiveTab] = useState(TIPOS_RELATORIOS[0].key)
  const tipo = TIPOS_RELATORIOS.find((t) => t.key === activeTab)

  return (
    <>
      <h1 className="mt-10 font-bold text-3xl">Relatórios</h1>
      <p className="mt-1 text-slate-500 text-sm">Gerencie o conteúdo editorial exibido no relatório SWOT</p>

      <PerguntasFolderTabs
        tipos={TIPOS_RELATORIOS}
        activeKey={activeTab}
        onChange={setActiveTab}
      >
        <RelatorioTipoPanel key={activeTab} tipo={tipo} />
      </PerguntasFolderTabs>
    </>
  )
}

export default Relatorios

import { useState } from 'react'
import PerguntasFolderTabs from '@/components/perguntas-folder-tabs'
import PerguntaTipoPanel from '@/components/pergunta-tipo-panel'
import { TIPOS_PERGUNTAS } from '@/constants/perguntas-config'

function Perguntas() {
  const [activeTab, setActiveTab] = useState(TIPOS_PERGUNTAS[0].key)
  const tipo = TIPOS_PERGUNTAS.find((t) => t.key === activeTab)

  return (
    <>
      <h1 className="mt-10 font-bold text-3xl">Perguntas</h1>
      <p className="mt-1 text-slate-500 text-sm">Gerencie as perguntas do questionário por tipo</p>

      <PerguntasFolderTabs
        tipos={TIPOS_PERGUNTAS}
        activeKey={activeTab}
        onChange={setActiveTab}
      >
        <PerguntaTipoPanel key={activeTab} tipo={tipo} />
      </PerguntasFolderTabs>
    </>
  )
}

export default Perguntas

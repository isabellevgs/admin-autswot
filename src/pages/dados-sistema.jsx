import { useState, useEffect } from 'react'
import AutoResizeTextarea from '@/components/auto-resize-textarea'
import BulletListField from '@/components/bullet-list-field'
import { 
  buscarTcle, 
  atualizarTcle, 
  buscarTermoUso,
  atualizarTermoUso,
  buscarBloqueioAcesso,
  atualizarBloqueioAcesso,
  buscarUsuarioPorEmail 
} from '@/utils/appDataUtils'

const inputClass =
  'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-violet-400 bg-white'

function DadosSistema() {
  const [tcle, setTcle] = useState('')
  const [termoUso, setTermoUso] = useState('')
  const [bloquearAcesso, setBloquearAcesso] = useState(false)
  const [dataInicioAcesso, setDataInicioAcesso] = useState('')
  const [dataFimAcesso, setDataFimAcesso] = useState('')
  const [emailsComAcesso, setEmailsComAcesso] = useState([''])
  const [infoPorEmail, setInfoPorEmail] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    carregar()
  }, [])

  useEffect(() => {
    const emailsParaBuscar = emailsComAcesso
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e && e.includes('@') && !(e in infoPorEmail))
  
    if (emailsParaBuscar.length === 0) return
  
    const timeout = setTimeout(() => {
      emailsParaBuscar.forEach(async (email) => {
        setInfoPorEmail((prev) => ({ ...prev, [email]: { carregando: true } }))
        const { usuario, erro } = await buscarUsuarioPorEmail(email)
        setInfoPorEmail((prev) => ({
          ...prev,
          [email]: { nome: usuario?.nome, dataCadastro: usuario?.dataCadastro, carregando: false, erro },
        }))
      })
    }, 600)
  
    return () => clearTimeout(timeout)
  }, [emailsComAcesso, infoPorEmail])

  const carregar = async () => {
    setLoading(true)
    setError(null)
    const [{ tcle, erro: erroTcle }, { termoUso, erro: erroTermoUso }, bloqueio] = await Promise.all([
      buscarTcle(),
      buscarTermoUso(),
      buscarBloqueioAcesso(),
    ])
    setTcle(tcle ?? '')    
    setTermoUso(termoUso ?? '')
    setBloquearAcesso(!!bloqueio.bloquearAcesso)
    setDataInicioAcesso(bloqueio.dataInicioAcesso ?? '')
    setDataFimAcesso(bloqueio.dataFimAcesso ?? '')
    setEmailsComAcesso(bloqueio.emailsComAcesso?.length ? bloqueio.emailsComAcesso : [''])
    setError(erroTcle ?? erroTermoUso ?? bloqueio.erro)
    setLoading(false)
  }

  const handleSalvar = async () => {
    setSalvando(true)
    setError(null)
    setSalvo(false)

    const emails = emailsComAcesso.map((e) => e.trim()).filter(Boolean)

    const [tcleResult, termoUsoResult, bloqueioResult] = await Promise.all([
      atualizarTcle(tcle),
      atualizarTermoUso(termoUso),
      atualizarBloqueioAcesso(bloquearAcesso, dataInicioAcesso, dataFimAcesso, emails),
    ])

    const erro = tcleResult.erro ?? termoUsoResult.erro ?? bloqueioResult.erro
    if (erro) {
      setError(erro)
    } else {
      setSalvo(true)
      setTimeout(() => setSalvo(false), 3000)
    }
    setSalvando(false)
  }

  return (
    <>
      <h1 className="mt-10 font-bold text-3xl">Dados do sistema</h1>
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}
      {loading ? (
        <div className="mt-8 text-center text-slate-500 py-8">Carregando...</div>
      ) : (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div>
            <label htmlFor="tcle" className="block text-sm font-semibold text-slate-700 mb-2">
              Termo de Consentimento Livre e Esclarecido (TCLE)
            </label>
            <AutoResizeTextarea
              id="tcle"
              value={tcle}
              onChange={(e) => setTcle(e.target.value)}
              minRows={12}
              placeholder="Escreva o texto do termo aqui…"
            />
          </div>

          <div>
            <label htmlFor="termo-uso" className="block text-sm font-semibold text-slate-700 mb-2">
              Termo de Uso
            </label>
            <AutoResizeTextarea
              id="termo-uso"
              value={termoUso}
              onChange={(e) => setTermoUso(e.target.value)}
              minRows={12}
              placeholder="Escreva o texto do termo de uso aqui…"
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={bloquearAcesso}
                onChange={(e) => setBloquearAcesso(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-400"
              />
              Bloquear acesso
            </label>

            {bloquearAcesso && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-violet-200 bg-violet-50/40">
                <div>
                  <label htmlFor="data-inicio-acesso" className="block text-sm font-medium text-slate-700 mb-1">
                    Data de início do acesso
                  </label>
                  <input
                    id="data-inicio-acesso"
                    type="date"
                    value={dataInicioAcesso}
                    onChange={(e) => setDataInicioAcesso(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="data-fim-acesso" className="block text-sm font-medium text-slate-700 mb-1">
                    Data de fim do acesso
                  </label>
                  <input
                    id="data-fim-acesso"
                    type="date"
                    value={dataFimAcesso}
                    onChange={(e) => setDataFimAcesso(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Emails com acesso
                  </label>
                  <BulletListField
                    value={emailsComAcesso}
                    onChange={setEmailsComAcesso}
                    placeholder="email@exemplo.com"
                    renderExtra={(email) => {
                      const emailNormalizado = email.trim().toLowerCase()
                      const info = infoPorEmail[emailNormalizado]
                      if (!info?.nome) return null
                      return (
                        <span className="text-xs text-slate-500">
                          {info.nome} · cadastrado em {new Date(info.dataCadastro).toLocaleDateString('pt-BR')}
                        </span>
                      )
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {salvo && (
            <p className="text-sm text-green-600 font-medium">Salvo com sucesso!</p>
          )}
          <div className="flex justify-end">
            <button
              onClick={handleSalvar}
              disabled={salvando}
              className="px-6 py-2.5 rounded-lg bg-violet-700 text-white font-semibold hover:bg-violet-800 transition-colors disabled:opacity-60"
            >
              {salvando ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default DadosSistema

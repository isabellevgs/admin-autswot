import { useState, useEffect } from 'react'
import AutoResizeTextarea from '@/components/auto-resize-textarea'
import { buscarTcle, atualizarTcle } from '@/utils/appDataUtils'

function DadosSistema() {
  const [tcle, setTcle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    carregar()
  }, [])

  const carregar = async () => {
    setLoading(true)
    setError(null)
    const { tcle, erro } = await buscarTcle()
    setTcle(tcle ?? '')
    setError(erro)
    setLoading(false)
  }

  const handleSalvar = async () => {
    setSalvando(true)
    setError(null)
    setSalvo(false)
    const { erro } = await atualizarTcle(tcle)
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

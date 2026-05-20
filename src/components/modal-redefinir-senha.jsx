import { useState } from 'react'
import { X, Eye, EyeOff, KeyRound, CheckCircle } from 'lucide-react'
import api from '@/services/api'

function InputSenha({ id, label, value, onChange, error }) {
  const [visivel, setVisivel] = useState(false)
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visivel ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete="new-password"
          className={`w-full rounded-lg border px-3 py-2.5 pr-10 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${
            error ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'
          }`}
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setVisivel(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          tabIndex={-1}
        >
          {visivel ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function ModalRedefinirSenha({ person, onClose }) {
  const [novaSenha, setNovaSenha]         = useState('')
  const [confirmar, setConfirmar]         = useState('')
  const [erros, setErros]                 = useState({})
  const [salvando, setSalvando]           = useState(false)
  const [erroGeral, setErroGeral]         = useState(null)
  const [sucesso, setSucesso]             = useState(false)

  function validar() {
    const e = {}
    if (novaSenha.length < 8) e.novaSenha = 'A senha deve ter pelo menos 8 caracteres.'
    if (!confirmar) e.confirmar = 'Confirme a nova senha.'
    else if (novaSenha !== confirmar) e.confirmar = 'As senhas não coincidem.'
    setErros(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validar()) return

    setSalvando(true)
    setErroGeral(null)
    try {
      await api.patch(`/users/${person.id}/password`, { password: novaSenha })
      setSucesso(true)
      setTimeout(onClose, 1500)
    } catch (err) {
      setErroGeral(err?.response?.data?.message ?? 'Não foi possível redefinir a senha. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <KeyRound size={18} className="text-violet-600" />
            <div>
              <h2 className="text-base font-semibold text-slate-900">Redefinir senha</h2>
              <p className="text-xs text-slate-500 mt-0.5">{person?.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-5 space-y-4">
            {sucesso ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CheckCircle size={40} className="text-green-500" />
                <p className="text-sm font-medium text-slate-700">Senha redefinida com sucesso!</p>
              </div>
            ) : (
              <>
                <InputSenha
                  id="nova-senha"
                  label="Nova senha"
                  value={novaSenha}
                  onChange={setNovaSenha}
                  error={erros.novaSenha}
                />
                <InputSenha
                  id="confirmar-senha"
                  label="Confirmar nova senha"
                  value={confirmar}
                  onChange={setConfirmar}
                  error={erros.confirmar}
                />
                {erroGeral && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {erroGeral}
                  </p>
                )}
              </>
            )}
          </div>

          {!sucesso && (
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-60 transition-colors"
              >
                {salvando ? 'Salvando…' : 'Redefinir senha'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default ModalRedefinirSenha

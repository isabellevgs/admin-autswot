import { useState, useEffect } from 'react'
import { X, ClipboardList } from 'lucide-react'
import api from '@/services/api'
import { extrairErroApi } from '@/utils/api-errors'
import ProfileRegistrationDisplay from '@/components/profile-registration-display'

function ModalCadastro({ person, onClose }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const { data: resp } = await api.get(`/users/${person.id}/registration`)
        if (!cancelled) setData(resp.user)
      } catch (err) {
        if (!cancelled) {
          setError(extrairErroApi(err, 'Não foi possível carregar o cadastro. Tente novamente.'))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [person.id])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative flex flex-col w-full max-w-3xl max-h-[90vh] bg-white rounded-xl shadow-xl">

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <ClipboardList size={18} className="text-violet-600 shrink-0" />
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-900">Ver cadastro</h2>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {data?.name ?? person?.name} · {data?.email ?? person?.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && (
            <p className="text-sm text-slate-500 text-center py-8">Carregando cadastro...</p>
          )}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {!loading && !error && (
            <ProfileRegistrationDisplay registration={data?.profileRegistration} />
          )}
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-slate-200 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalCadastro

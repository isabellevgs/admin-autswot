import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

function NotFound() {
  return (
    <div className="mt-16 text-center">
      <h1 className="text-6xl font-bold text-violet-700 mb-2">404</h1>
      <p className="text-lg text-slate-600 mb-8">Página não encontrada</p>
      <Link
        to="/pessoas"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-700 text-white hover:bg-violet-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para Pessoas
      </Link>
    </div>
  )
}

export default NotFound

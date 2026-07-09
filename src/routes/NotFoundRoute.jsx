import { useAuth } from '@/contexts/AuthContext'
import AuthenticatedLayout from '@/components/authenticated-layout'
import NotFound from '@/pages/not-found'

function NotFoundRoute() {
  const { signed, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Carregando...
      </div>
    )
  }

  if (signed) {
    return (
      <AuthenticatedLayout>
        <NotFound />
      </AuthenticatedLayout>
    )
  }

  return <NotFound />
}

export default NotFoundRoute

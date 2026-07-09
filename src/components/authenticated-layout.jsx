import Topbar from '@/components/topbar'
import PageContainer from '@/components/page-container'
import { useAuth } from '@/contexts/AuthContext'

function AuthenticatedLayout({ children }) {
  const { sessionDegraded } = useAuth()

  return (
    <PageContainer>
      {sessionDegraded && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          Não foi possível verificar sua sessão com o servidor. Os dados exibidos podem estar desatualizados.
          Ações administrativas podem falhar até a conexão ser restabelecida.
        </div>
      )}
      <Topbar />
      {children}
    </PageContainer>
  )
}

export default AuthenticatedLayout

import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PrivateRoute = ({ children }) => {
  const { signed, user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!signed) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.role?.toString().trim().toUpperCase();
  if (user && userRole !== 'SUPER_USER') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Negado</h2>
          <p className="text-gray-600 mb-6">
            Apenas super usuários podem acessar o painel administrativo.
          </p>
          <button
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            className="px-6 py-2 bg-violet-700 text-white rounded-lg hover:bg-violet-800 transition-colors"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default PrivateRoute;

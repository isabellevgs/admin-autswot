import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function LoginRedirect({ children }) {
  const { signed, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-violet-100">
        <div className="w-12 h-12 border-4 border-violet-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (signed) {
    return <Navigate to="/pessoas" replace />;
  }

  return children;
}

export default LoginRedirect;

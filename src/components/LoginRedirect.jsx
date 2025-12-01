import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function LoginRedirect({ children }) {
  const { signed } = useAuth();

  if (signed) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

export default LoginRedirect;


import { Routes, Route, Navigate } from 'react-router-dom';

import Posts from './pages/posts';
import DadosSistema from './pages/dados-sistema';
import Comunidade from './pages/comunidade';
import PostDetail from './pages/post-detail';
import Pessoas from './pages/pessoas';
import Perguntas from './pages/perguntas';
import Relatorios from './pages/relatorios';
import Login from './pages/login';
import NotFoundRoute from './routes/NotFoundRoute';
import AuthenticatedLayout from './components/authenticated-layout';
import PrivateRoute from './routes/PrivateRoute';
import LoginRedirect from './components/LoginRedirect';

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginRedirect><Login /></LoginRedirect>}
      />

      <Route path="/home" element={<Navigate to="/pessoas" replace />} />

      <Route
        path="/pessoas"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <Pessoas />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/posts"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <Posts />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/comunidade"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <Comunidade />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/comunidade/post/:id"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <PostDetail />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/perguntas"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <Perguntas />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/relatorios"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <Relatorios />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dados-sistema"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <DadosSistema />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />

      <Route path="/" element={<Navigate to="/pessoas" replace />} />
      <Route path="*" element={<NotFoundRoute />} />
    </Routes>
  )
}

export default App

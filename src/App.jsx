import Topbar from './components/topbar';
import { Routes, Route, Navigate } from 'react-router-dom';



import Posts from './pages/posts';
import Comunidade from './pages/comunidade';
import PostDetail from './pages/post-detail';
import Pessoas from './pages/pessoas';
import Login from './pages/login';
import PageContainer from './components/page-container';
import PrivateRoute from './routes/PrivateRoute';
import LoginRedirect from './components/LoginRedirect';

function App() {
  return (
    <Routes>
      {/* Rota pública - Login */}
      <Route 
        path="/login" 
        element={<LoginRedirect><Login /></LoginRedirect>} 
      />

      {/* Rotas protegidas - Requerem autenticação e role SUPER_USER */}
      <Route
        path="/home"
        element={
          <PrivateRoute>
            <PageContainer>
              <Topbar />
            </PageContainer>
            <Pessoas />
          </PrivateRoute>
        }
      />
      <Route
        path="/pessoas"
        element={
          <PrivateRoute>
            <PageContainer>
              <Topbar />
            </PageContainer>
            <Pessoas />
          </PrivateRoute>
        }
      />
      <Route
        path="/posts"
        element={
          <PrivateRoute>
            <PageContainer>
              <Topbar />
            </PageContainer>
            <Posts />
          </PrivateRoute>
        }
      />
      <Route
        path="/comunidade"
        element={
          <PrivateRoute>
            <PageContainer>
              <Topbar />
            </PageContainer>
            <Comunidade />
          </PrivateRoute>
        }
      />
      <Route
        path="/comunidade/post/:id"
        element={
          <PrivateRoute>
            <PageContainer>
              <Topbar />
            </PageContainer>
            <PostDetail />
          </PrivateRoute>
        }
      />
      
      {/* Redirecionar rota raiz */}
      <Route path="/" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default App

import { createBrowserRouter, Navigate } from 'react-router';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Vendas } from './pages/Vendas';
import { Estoque } from './pages/Estoque';
import { Reposicao } from './pages/Reposicao';
import { Relatorios } from './pages/Relatorios';
import { Funcionarios } from './pages/Funcionarios';
import { useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'proprietaria' ? '/dashboard' : '/vendas'} replace />;
  }

  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['proprietaria']}>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/vendas',
    element: (
      <ProtectedRoute allowedRoles={['funcionario', 'proprietaria']}>
        <Vendas />
      </ProtectedRoute>
    ),
  },
  {
    path: '/estoque',
    element: (
      <ProtectedRoute allowedRoles={['proprietaria']}>
        <Estoque />
      </ProtectedRoute>
    ),
  },
  {
    path: '/reposicao',
    element: (
      <ProtectedRoute allowedRoles={['proprietaria']}>
        <Reposicao />
      </ProtectedRoute>
    ),
  },
  {
    path: '/relatorios',
    element: (
      <ProtectedRoute allowedRoles={['proprietaria']}>
        <Relatorios />
      </ProtectedRoute>
    ),
  },
  {
    path: '/funcionarios',
    element: (
      <ProtectedRoute allowedRoles={['proprietaria']}>
        <Funcionarios />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);

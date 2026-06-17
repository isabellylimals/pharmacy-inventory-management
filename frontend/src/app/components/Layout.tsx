import React, { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ClipboardList,
  FileText,
  LogOut,
  Moon,
  Sun,
  User,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso');
    navigate('/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['proprietaria'],
    },
    {
      path: '/vendas',
      label: 'Vendas (PDV)',
      icon: ShoppingCart,
      roles: ['funcionario', 'proprietaria'],
    },
    {
      path: '/estoque',
      label: 'Estoque',
      icon: Package,
      roles: ['proprietaria'],
    },
    {
      path: '/reposicao',
      label: 'Reposição',
      icon: ClipboardList,
      roles: ['proprietaria'],
    },
    {
      path: '/funcionarios',
      label: 'Funcionários',
      icon: Users,
      roles: ['proprietaria'],
    },
    {
      path: '/relatorios',
      label: 'Relatórios',
      icon: FileText,
      roles: ['proprietaria'],
    },
  ];

  const availableItems = menuItems.filter((item) =>
    item.roles.includes(user?.role || '')
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r bg-card p-4 flex flex-col">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#0E006D' }}
            >
              <Package className="w-5 h-5 text-white" />
            </div>

            <h1 className="font-bold text-lg">
              Farmácia Sistema
            </h1>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
            <User className="w-4 h-4" />
            <div>
              <p className="font-medium text-foreground">
                {user?.nome}
              </p>
              <p className="text-xs capitalize">
                {user?.role}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {availableItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'text-foreground hover:bg-accent'
                }`}
                style={
                  isActive
                    ? { backgroundColor: '#0E006D' }
                    : {}
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="space-y-2 border-t pt-4">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-5 h-5 mr-3" />
                Tema Claro
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 mr-3" />
                Tema Escuro
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={() => setShowLogoutModal(true)}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {children}
      </main>

      {/* Modal de confirmação de saída */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">
              Confirmar saída
            </h2>

            <p className="text-muted-foreground mb-6">
              Tem certeza que deseja sair do sistema?
            </p>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancelar
              </Button>

              <Button
                variant="destructive"
                onClick={() => {
                  setShowLogoutModal(false);
                  handleLogout();
                }}
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
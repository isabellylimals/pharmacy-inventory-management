import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiRequest, setAuthToken } from '../services/api';

export type UserRole = 'funcionario' | 'proprietaria';

export interface User {
  id: string;
  nome: string;
  role: UserRole;
  username: string;
}

export interface Funcionario {
  id: string;
  nome: string;
  username: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  funcionarios: Funcionario[];
  cadastrarFuncionario: (nome: string, username: string, password: string) => Promise<boolean>;
  removerFuncionario: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const carregarFuncionarios = async () => {
    try {
      const response: any[] = await apiRequest('/usuarios');
      const mapped = response.map((u: any) => ({
        id: String(u.id),
        nome: u.nome,
        username: u.login,
        password: '• • • • • •', // Hidden password for UI display
      }));
      setFuncionarios(mapped);
    } catch (error) {
      console.error('Erro ao carregar funcionários do backend:', error);
    }
  };

  useEffect(() => {
    if (user && user.role === 'proprietaria') {
      carregarFuncionarios();
    } else {
      setFuncionarios([]);
    }
  }, [user]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ login: username, senha: password }),
      });

      if (response && response.token) {
        setAuthToken(response.token);
        const mappedRole: UserRole = response.perfil === 'ADMIN' ? 'proprietaria' : 'funcionario';
        const loggedUser: User = {
          id: String(response.usuarioId),
          nome: response.nome,
          role: mappedRole,
          username: username,
        };
        setUser(loggedUser);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('user');
  };

  const cadastrarFuncionario = async (nome: string, username: string, password: string): Promise<boolean> => {
    try {
      await apiRequest('/usuarios', {
        method: 'POST',
        body: JSON.stringify({
          nome,
          login: username,
          senha: password,
          perfil: 'ATENDENTE',
        }),
      });
      await carregarFuncionarios();
      return true;
    } catch (error) {
      console.error('Erro ao cadastrar funcionário:', error);
      return false;
    }
  };

  const removerFuncionario = async (id: string): Promise<void> => {
    try {
      await apiRequest(`/usuarios/${id}`, {
        method: 'DELETE',
      });
      await carregarFuncionarios();
    } catch (error) {
      console.error('Erro ao remover funcionário:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        funcionarios,
        cadastrarFuncionario,
        removerFuncionario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

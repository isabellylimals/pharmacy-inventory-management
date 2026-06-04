import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Pill, Lock, User } from 'lucide-react';
import { toast } from 'sonner';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error('Preencha todos os campos');
      return;
    }

    const success = await login(username, password);

    if (success) {
      toast.success('Login realizado com sucesso!');
      // Usa um timeout curto para garantir que o contexto foi atualizado
      setTimeout(() => {
        const isProprietaria = username === 'admin';
        navigate(isProprietaria ? '/dashboard' : '/vendas');
      }, 100);
    } else {
      toast.error('Credenciais inválidas. Verifique seu usuário e senha.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: '#ede8d0' }}>
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: '#0E006D' }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: '#0E006D' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-5 blur-3xl" style={{ backgroundColor: '#0E006D' }}></div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with gradient */}
          <div className="relative h-48 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0E006D 0%, #1a0f8f 100%)' }}>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white transform translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white transform -translate-x-20 translate-y-20"></div>
            </div>
            <div className="relative">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                <Pill className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white text-center tracking-tight">Farmácia Sistema</h1>
              <p className="text-white/80 text-center mt-2 text-sm">Gestão Inteligente de Estoque</p>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold" style={{ color: '#0E006D' }}>Bem-vindo de volta</h2>
              <p className="text-gray-600 mt-1">Faça login para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700">Usuário</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Digite seu usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 h-12 border-2 focus:border-[#0E006D] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 border-2 focus:border-[#0E006D] transition-colors"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                style={{ backgroundColor: '#0E006D' }}
              >
                Entrar no Sistema
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600 space-y-1">
                <p className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#0E006D' }}></span>
                  <span>Credenciais de demonstração:</span>
                </p>
                <p className="text-center">
                  <strong>Proprietária:</strong> admin / admin123
                </p>
                <p className="text-center">
                  <strong>Funcionário:</strong> maria / 123
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>Sistema de Gerenciamento de Farmácia © 2024</p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { UserPlus, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

export function Funcionarios() {
  const { funcionarios, cadastrarFuncionario, removerFuncionario } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleCadastrar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !username || !password) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (username.length < 3) {
      toast.error('O usuário deve ter pelo menos 3 caracteres');
      return;
    }

    if (password.length < 3) {
      toast.error('A senha deve ter pelo menos 3 caracteres');
      return;
    }

    const success = await cadastrarFuncionario(nome, username, password);

    if (success) {
      toast.success('Funcionário cadastrado com sucesso!');
      setNome('');
      setUsername('');
      setPassword('');
      setDialogOpen(false);
    } else {
      toast.error('Erro ao cadastrar funcionário. Verifique se o usuário já existe.');
    }
  };

  const handleRemover = async (id: string, nomeFuncionario: string) => {
    if (window.confirm(`Tem certeza que deseja remover ${nomeFuncionario}?`)) {
      await removerFuncionario(id);
      toast.success('Funcionário removido com sucesso');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Funcionários</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os funcionários que têm acesso ao sistema
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: '#0E006D' }} className="text-white">
                <UserPlus className="w-4 h-4 mr-2" />
                Cadastrar Funcionário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCadastrar}>
                <DialogHeader>
                  <DialogTitle>Cadastrar Novo Funcionário</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do novo funcionário. Ele poderá fazer login com as credenciais cadastradas.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input
                      id="nome"
                      placeholder="Ex: Maria Silva"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Usuário (Login)</Label>
                    <Input
                      id="username"
                      placeholder="Ex: maria.silva"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    />
                    <p className="text-xs text-muted-foreground">
                      Mínimo 3 caracteres, sem espaços
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Digite a senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Mínimo 3 caracteres
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    style={{ backgroundColor: '#0E006D' }}
                    className="text-white"
                  >
                    Cadastrar
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Funcionários Cadastrados
            </CardTitle>
            <CardDescription>
              Total de {funcionarios.length} funcionário(s) cadastrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {funcionarios.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  Nenhum funcionário cadastrado ainda
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Clique em "Cadastrar Funcionário" para adicionar o primeiro
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Senha</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {funcionarios.map((funcionario) => (
                    <TableRow key={funcionario.id}>
                      <TableCell className="font-medium">
                        {funcionario.nome}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {funcionario.username}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {funcionario.password}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleRemover(funcionario.id, funcionario.nome)
                          }
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

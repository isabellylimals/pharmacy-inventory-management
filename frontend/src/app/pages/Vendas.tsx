import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Search, ShoppingCart, Trash2, Plus, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { ItemVenda, Produto, TipoReceita } from '../contexts/StoreContext';

export function Vendas() {
  const { produtos, registrarVenda } = useStore();
  const { user } = useAuth();
  const [busca, setBusca] = useState('');
  const [carrinho, setCarrinho] = useState<ItemVenda[]>([]);
  const [modalReceita, setModalReceita] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [tipoReceita, setTipoReceita] = useState<TipoReceita>('B1');
  const [numeroReceita, setNumeroReceita] = useState('');
  const [crmMedico, setCrmMedico] = useState('');

  const produtosFiltrados = produtos.filter(
    (p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.principioAtivo.toLowerCase().includes(busca.toLowerCase())
  );

  const adicionarAoCarrinho = (produto: Produto) => {
    if (produto.estoque === 0) {
      toast.error('Produto sem estoque');
      return;
    }

    if (produto.tipoControle === 'controlado') {
      setProdutoSelecionado(produto);
      setModalReceita(true);
      return;
    }

    const itemExistente = carrinho.find((item) => item.produto.id === produto.id);
    
    if (itemExistente) {
      if (itemExistente.quantidade >= produto.estoque) {
        toast.error('Estoque insuficiente');
        return;
      }
      setCarrinho(
        carrinho.map((item) =>
          item.produto.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        )
      );
    } else {
      setCarrinho([...carrinho, { produto, quantidade: 1 }]);
    }
    
    toast.success(`${produto.nome} adicionado ao carrinho`);
  };

  const confirmarReceita = () => {
    if (!numeroReceita || !crmMedico) {
      toast.error('Preencha todos os campos da receita');
      return;
    }

    if (produtoSelecionado) {
      const itemExistente = carrinho.find((item) => item.produto.id === produtoSelecionado.id);
      
      if (itemExistente) {
        setCarrinho(
          carrinho.map((item) =>
            item.produto.id === produtoSelecionado.id
              ? { ...item, quantidade: item.quantidade + 1 }
              : item
          )
        );
      } else {
        setCarrinho([
          ...carrinho,
          {
            produto: produtoSelecionado,
            quantidade: 1,
            receita: { tipoReceita, numeroReceita, crmMedico },
          },
        ]);
      }

      toast.success(`${produtoSelecionado.nome} adicionado com receita registrada`);
      setModalReceita(false);
      setProdutoSelecionado(null);
      setNumeroReceita('');
      setCrmMedico('');
    }
  };

  const removerDoCarrinho = (produtoId: string) => {
    setCarrinho(carrinho.filter((item) => item.produto.id !== produtoId));
    toast.info('Item removido do carrinho');
  };

  const finalizarVenda = () => {
    if (carrinho.length === 0) {
      toast.error('Carrinho vazio');
      return;
    }

    const total = carrinho.reduce(
      (acc, item) => acc + item.produto.preco * item.quantidade,
      0
    );

    registrarVenda({
      vendedorId: user?.id || '',
      vendedorNome: user?.nome || '',
      itens: carrinho,
      total,
    });

    toast.success('Venda registrada, estoque atualizado!');
    setCarrinho([]);
  };

  const total = carrinho.reduce(
    (acc, item) => acc + item.produto.preco * item.quantidade,
    0
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">PDV - Ponto de Venda</h1>
            <p className="text-muted-foreground">Vendedor: {user?.nome}</p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <ShoppingCart className="w-4 h-4 mr-2" />
            {carrinho.length} itens
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Produtos */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Buscar Produtos</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou princípio ativo..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {produtosFiltrados.map((produto) => (
                    <div
                      key={produto.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{produto.nome}</p>
                          {produto.tipoControle === 'controlado' && (
                            <Badge variant="destructive">Controlado</Badge>
                          )}
                          {produto.categoria === 'original' && (
                            <Badge variant="secondary">Original</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {produto.principioAtivo} • {produto.fabricante}
                        </p>
                        <p className="text-sm font-medium" style={{ color: '#0E006D' }}>
                          R$ {produto.preco.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            produto.estoque < produto.estoqueMinimo ? 'text-red-500' : 'text-green-600'
                          }`}>
                            {produto.estoque} un.
                          </p>
                          <p className="text-xs text-muted-foreground">em estoque</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => adicionarAoCarrinho(produto)}
                          disabled={produto.estoque === 0}
                          style={{ backgroundColor: '#0E006D' }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Carrinho */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Carrinho de Compras</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {carrinho.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Carrinho vazio
                  </p>
                ) : (
                  <>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {carrinho.map((item) => (
                        <div
                          key={item.produto.id}
                          className="flex items-start justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.produto.nome}</p>
                            <p className="text-xs text-muted-foreground">
                              R$ {item.produto.preco.toFixed(2)} x {item.quantidade}
                            </p>
                            {item.receita && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                <FileText className="w-3 h-3 mr-1" />
                                Receita: {item.receita.numeroReceita}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm">
                              R$ {(item.produto.preco * item.quantidade).toFixed(2)}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removerDoCarrinho(item.produto.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-medium">Total:</p>
                        <p className="text-2xl font-bold" style={{ color: '#0E006D' }}>
                          R$ {total.toFixed(2)}
                        </p>
                      </div>
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={finalizarVenda}
                        style={{ backgroundColor: '#0E006D' }}
                      >
                        Finalizar Venda
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de Receita para Controlados */}
      <Dialog open={modalReceita} onOpenChange={setModalReceita}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registro de Receita - Medicamento Controlado</DialogTitle>
            <DialogDescription>
              Este medicamento requer receita médica. Preencha as informações abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Produto</Label>
              <p className="text-sm font-medium mt-1">{produtoSelecionado?.nome}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo-receita">Tipo de Receita</Label>
              <Select value={tipoReceita} onValueChange={(value) => setTipoReceita(value as TipoReceita)}>
                <SelectTrigger id="tipo-receita">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B1">B1 (Azul)</SelectItem>
                  <SelectItem value="A1">A1 (Amarela)</SelectItem>
                  <SelectItem value="A2">A2 (Amarela - 2 vias)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero-receita">Número da Receita</Label>
              <Input
                id="numero-receita"
                placeholder="Ex: 123456"
                value={numeroReceita}
                onChange={(e) => setNumeroReceita(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="crm-medico">CRM do Médico</Label>
              <Input
                id="crm-medico"
                placeholder="Ex: CRM 12345/SP"
                value={crmMedico}
                onChange={(e) => setCrmMedico(e.target.value)}
              />
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ A receita física deve ser anexada ao sistema ou arquivada conforme regulamentação da ANVISA.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setModalReceita(false);
                  setProdutoSelecionado(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={confirmarReceita}
                style={{ backgroundColor: '#0E006D' }}
              >
                Confirmar e Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

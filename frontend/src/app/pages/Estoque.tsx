import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Plus, Package, ArrowUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Categoria, TipoControle } from '../contexts/StoreContext';

export function Estoque() {
  const { produtos, adicionarProduto, adicionarEstoque } = useStore();
  const { user } = useAuth();
  const [modalCadastro, setModalCadastro] = useState(false);
  const [modalEntrada, setModalEntrada] = useState(false);
  const [produtoEntrada, setProdutoEntrada] = useState<string>('');
  const [quantidadeEntrada, setQuantidadeEntrada] = useState('');

  // Form states
  const [nome, setNome] = useState('');
  const [principioAtivo, setPrincipioAtivo] = useState('');
  const [fabricante, setFabricante] = useState('');
  const [lote, setLote] = useState('');
  const [validade, setValidade] = useState('');
  const [categoria, setCategoria] = useState<Categoria>('generico');
  const [tipoControle, setTipoControle] = useState<TipoControle>('nao-controlado');
  const [estoque, setEstoque] = useState('');
  const [estoqueMinimo, setEstoqueMinimo] = useState('');
  const [preco, setPreco] = useState('');

  const handleCadastro = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !principioAtivo || !fabricante || !lote || !validade || !estoque || !estoqueMinimo || !preco) {
      toast.error('Preencha todos os campos');
      return;
    }

    adicionarProduto({
      nome,
      principioAtivo,
      fabricante,
      lote,
      validade: new Date(validade),
      categoria,
      tipoControle,
      estoque: parseInt(estoque),
      estoqueMinimo: parseInt(estoqueMinimo),
      preco: parseFloat(preco),
    });

    toast.success('Produto cadastrado com sucesso!');
    setModalCadastro(false);
    limparForm();
  };

  const limparForm = () => {
    setNome('');
    setPrincipioAtivo('');
    setFabricante('');
    setLote('');
    setValidade('');
    setCategoria('generico');
    setTipoControle('nao-controlado');
    setEstoque('');
    setEstoqueMinimo('');
    setPreco('');
  };

  const handleEntrada = () => {
    if (!produtoEntrada || !quantidadeEntrada) {
      toast.error('Preencha todos os campos');
      return;
    }

    adicionarEstoque(produtoEntrada, parseInt(quantidadeEntrada), user?.nome || 'Sistema');
    toast.success('Estoque atualizado com sucesso!');
    setModalEntrada(false);
    setProdutoEntrada('');
    setQuantidadeEntrada('');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Estoque</h1>
            <p className="text-muted-foreground">Cadastro e controle de produtos</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setModalEntrada(true)}
              variant="outline"
            >
              <ArrowUp className="w-4 h-4 mr-2" />
              Nova Entrada
            </Button>
            <Button
              onClick={() => setModalCadastro(true)}
              style={{ backgroundColor: '#0E006D' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Produto
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Produtos Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Princípio Ativo</TableHead>
                  <TableHead>Fabricante</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead className="text-center">Estoque</TableHead>
                  <TableHead className="text-center">Mín.</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos.map((produto) => {
                  const estoqueAbaixo = produto.estoque < produto.estoqueMinimo;
                  const estoqueCritico = produto.estoque < produto.estoqueMinimo / 2;

                  return (
                    <TableRow key={produto.id} className={estoqueAbaixo ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {produto.nome}
                          {produto.categoria === 'original' && (
                            <Badge variant="secondary" className="text-xs">Original</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{produto.principioAtivo}</TableCell>
                      <TableCell>{produto.fabricante}</TableCell>
                      <TableCell>{produto.lote}</TableCell>
                      <TableCell>{produto.validade.toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-center">
                        <span className={`font-medium ${
                          estoqueCritico ? 'text-red-600' : estoqueAbaixo ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {produto.estoque}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {produto.estoqueMinimo}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {produto.tipoControle === 'controlado' && (
                            <Badge variant="destructive" className="text-xs">Controlado</Badge>
                          )}
                          {estoqueAbaixo && (
                            <Badge variant="outline" className="text-xs text-red-600 border-red-600">
                              {estoqueCritico ? 'CRÍTICO' : 'BAIXO'}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        R$ {produto.preco.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Cadastro */}
      <Dialog open={modalCadastro} onOpenChange={setModalCadastro}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Produto</DialogTitle>
            <DialogDescription>
              Preencha todos os campos para cadastrar um novo produto no estoque
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCadastro} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="nome">Nome do Produto *</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Paracetamol 500mg"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="principio">Princípio Ativo *</Label>
                <Input
                  id="principio"
                  placeholder="Ex: Paracetamol"
                  value={principioAtivo}
                  onChange={(e) => setPrincipioAtivo(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fabricante">Fabricante *</Label>
                <Input
                  id="fabricante"
                  placeholder="Ex: EMS"
                  value={fabricante}
                  onChange={(e) => setFabricante(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lote">Lote *</Label>
                <Input
                  id="lote"
                  placeholder="Ex: L001"
                  value={lote}
                  onChange={(e) => setLote(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validade">Validade *</Label>
                <Input
                  id="validade"
                  type="date"
                  value={validade}
                  onChange={(e) => setValidade(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select value={categoria} onValueChange={(value) => setCategoria(value as Categoria)}>
                  <SelectTrigger id="categoria">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="generico">Genérico</SelectItem>
                    <SelectItem value="original">Original</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo-controle">Tipo de Controle *</Label>
                <Select value={tipoControle} onValueChange={(value) => setTipoControle(value as TipoControle)}>
                  <SelectTrigger id="tipo-controle">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nao-controlado">Não Controlado</SelectItem>
                    <SelectItem value="controlado">Controlado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estoque">Estoque Inicial *</Label>
                <Input
                  id="estoque"
                  type="number"
                  placeholder="0"
                  value={estoque}
                  onChange={(e) => setEstoque(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estoque-minimo">Estoque Mínimo *</Label>
                <Input
                  id="estoque-minimo"
                  type="number"
                  placeholder="0"
                  value={estoqueMinimo}
                  onChange={(e) => setEstoqueMinimo(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preco">Preço (R$) *</Label>
                <Input
                  id="preco"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                />
              </div>
            </div>

            {tipoControle === 'controlado' && (
              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 flex gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Medicamento controlado requer registro de receita em todas as vendas
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setModalCadastro(false);
                  limparForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                style={{ backgroundColor: '#0E006D' }}
              >
                <Package className="w-4 h-4 mr-2" />
                Cadastrar Produto
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Entrada */}
      <Dialog open={modalEntrada} onOpenChange={setModalEntrada}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Entrada de Estoque</DialogTitle>
            <DialogDescription>
              Adicione quantidade a um produto existente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="produto-entrada">Produto *</Label>
              <Select value={produtoEntrada} onValueChange={setProdutoEntrada}>
                <SelectTrigger id="produto-entrada">
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos.map((produto) => (
                    <SelectItem key={produto.id} value={produto.id}>
                      {produto.nome} (Estoque atual: {produto.estoque})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantidade-entrada">Quantidade *</Label>
              <Input
                id="quantidade-entrada"
                type="number"
                placeholder="0"
                value={quantidadeEntrada}
                onChange={(e) => setQuantidadeEntrada(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setModalEntrada(false);
                  setProdutoEntrada('');
                  setQuantidadeEntrada('');
                }}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleEntrada}
                style={{ backgroundColor: '#0E006D' }}
              >
                Confirmar Entrada
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

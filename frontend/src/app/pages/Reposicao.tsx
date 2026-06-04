import React from 'react';
import { Layout } from '../components/Layout';
import { useStore } from '../contexts/StoreContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { FileDown, AlertTriangle, Package } from 'lucide-react';
import { toast } from 'sonner';

export function Reposicao() {
  const { produtos, atualizarProduto, getProdutosAbaixoMinimo } = useStore();
  const produtosAbaixoMinimo = getProdutosAbaixoMinimo();

  const toggleEncomenda = (produtoId: string, encomenda: boolean) => {
    atualizarProduto(produtoId, { encomenda });
    toast.success(encomenda ? 'Produto marcado como encomenda' : 'Produto desmarcado como encomenda');
  };

  const exportarRelatorio = () => {
    // Simular exportação de relatório
    const csv = [
      ['Produto', 'Princípio Ativo', 'Estoque Atual', 'Estoque Mínimo', 'Sugestão de Compra', 'Encomenda'],
      ...produtosAbaixoMinimo.map((p) => [
        p.nome,
        p.principioAtivo,
        p.estoque,
        p.estoqueMinimo,
        p.estoqueMinimo * 2 - p.estoque,
        p.encomenda ? 'Sim' : 'Não',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reposicao_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    toast.success('Relatório exportado com sucesso!');
  };

  const totalSugestaoCompra = produtosAbaixoMinimo
    .filter((p) => !p.encomenda)
    .reduce((acc, p) => {
      const sugestao = p.estoqueMinimo * 2 - p.estoque;
      return acc + sugestao * p.preco;
    }, 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Lista de Reposição</h1>
            <p className="text-muted-foreground">
              Produtos abaixo do estoque mínimo que precisam ser repostos
            </p>
          </div>
          <Button
            onClick={exportarRelatorio}
            disabled={produtosAbaixoMinimo.length === 0}
            style={{ backgroundColor: '#0E006D' }}
          >
            <FileDown className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Produtos em Falta</CardTitle>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {produtosAbaixoMinimo.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Abaixo do estoque mínimo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Valor Estimado</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: '#0E006D' }}>
                R$ {totalSugestaoCompra.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Para reposição sugerida
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Encomendas</CardTitle>
              <Package className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {produtosAbaixoMinimo.filter((p) => p.encomenda).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Marcados como encomenda
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Reposição */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos para Reposição</CardTitle>
            <CardDescription>
              Marque como "Encomenda" os produtos que não devem gerar reposição automática
            </CardDescription>
          </CardHeader>
          <CardContent>
            {produtosAbaixoMinimo.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Estoque em dia!</h3>
                <p className="text-muted-foreground">
                  Não há produtos abaixo do estoque mínimo no momento
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Encomenda</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Princípio Ativo</TableHead>
                    <TableHead className="text-center">Estoque Atual</TableHead>
                    <TableHead className="text-center">Estoque Mínimo</TableHead>
                    <TableHead className="text-center">Sugestão Compra</TableHead>
                    <TableHead className="text-right">Valor Estimado</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtosAbaixoMinimo.map((produto) => {
                    const sugestaoCompra = produto.estoqueMinimo * 2 - produto.estoque;
                    const valorEstimado = sugestaoCompra * produto.preco;
                    const estoqueCritico = produto.estoque < produto.estoqueMinimo / 2;

                    return (
                      <TableRow
                        key={produto.id}
                        className={estoqueCritico ? 'bg-red-50 dark:bg-red-950/20' : 'bg-orange-50 dark:bg-orange-950/20'}
                      >
                        <TableCell>
                          <Checkbox
                            checked={produto.encomenda || false}
                            onCheckedChange={(checked) =>
                              toggleEncomenda(produto.id, checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {produto.nome}
                            {produto.categoria === 'original' && (
                              <Badge variant="secondary" className="text-xs">Original</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{produto.principioAtivo}</TableCell>
                        <TableCell className="text-center">
                          <span className={`font-medium ${estoqueCritico ? 'text-red-600' : 'text-orange-600'}`}>
                            {produto.estoque}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {produto.estoqueMinimo}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium" style={{ color: '#0E006D' }}>
                            {sugestaoCompra}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          R$ {valorEstimado.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          {produto.encomenda ? (
                            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/20">
                              Encomenda
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              {estoqueCritico ? 'CRÍTICO' : 'BAIXO'}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {produtosAbaixoMinimo.length > 0 && (
          <Card className="border-yellow-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                Instruções de Reposição
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>
                    A <strong>Sugestão de Compra</strong> é calculada como: (Estoque Mínimo × 2) - Estoque Atual
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>
                    Produtos marcados como <strong>Encomenda</strong> são excluídos do cálculo de reposição
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>
                    Use o botão <strong>Exportar Relatório</strong> para gerar um arquivo CSV com a lista completa
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <span>
                    Status <strong className="text-red-600">CRÍTICO</strong> indica estoque abaixo de 50% do mínimo
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

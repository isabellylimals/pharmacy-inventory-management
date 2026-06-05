import React from 'react';
import { Layout } from '../components/Layout';
import { useStore } from '../contexts/StoreContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Package, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const { produtos, vendas, getProdutosAbaixoMinimo, getProdutosProximosVencer } = useStore();

  const produtosAbaixoMinimo = getProdutosAbaixoMinimo();
  const produtosProximosVencer = getProdutosProximosVencer(30);
  
  const totalEstoque = produtos.reduce((acc, p) => acc + (p.estoque * p.preco), 0);
  const totalVendas = vendas.reduce((acc, v) => acc + v.total, 0);

  // Produtos mais vendidos
  const vendasPorProduto = vendas.reduce((acc, venda) => {
    venda.itens.forEach((item) => {
      const nome = item.produto.nome;
      if (!acc[nome]) {
        acc[nome] = 0;
      }
      acc[nome] += item.quantidade;
    });
    return acc;
  }, {} as Record<string, number>);

  const produtosMaisVendidos = Object.entries(vendasPorProduto)
    .map(([nome, quantidade]) => ({ nome, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 5);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do estoque e vendas</p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total em Estoque</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {totalEstoque.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {produtos.length} produtos cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {totalVendas.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {vendas.length} vendas realizadas
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Alertas de Vencimento</CardTitle>
              <AlertTriangle className="w-4 h-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {produtosProximosVencer.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Produtos vencem em 30 dias
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Itens em Falta</CardTitle>
              <TrendingUp className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {produtosAbaixoMinimo.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Abaixo do estoque mínimo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Produtos Mais Vendidos */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {produtosMaisVendidos.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={produtosMaisVendidos}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantidade" fill="#0E006D" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhuma venda registrada ainda
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alertas */}
        {produtosAbaixoMinimo.length > 0 && (
          <Card className="border-red-500">
            <CardHeader>
              <CardTitle className="text-red-600">Produtos com Estoque Baixo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {produtosAbaixoMinimo.map((produto) => (
                  <div
                    key={produto.id}
                    className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-md"
                  >
                    <div>
                      <p className="font-medium">{produto.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        Estoque: {produto.estoque} | Mínimo: {produto.estoqueMinimo}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-red-600">
                      {produto.estoque < produto.estoqueMinimo / 2 ? 'CRÍTICO' : 'BAIXO'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {produtosProximosVencer.length > 0 && (
          <Card className="border-orange-500">
            <CardHeader>
              <CardTitle className="text-orange-600">Produtos Próximos ao Vencimento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {produtosProximosVencer.map((produto) => (
                  <div
                    key={produto.id}
                    className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-md"
                  >
                    <div>
                      <p className="font-medium">{produto.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        Lote: {produto.lote}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-orange-600">
                      {produto.validade.toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

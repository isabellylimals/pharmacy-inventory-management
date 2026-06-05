import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useStore } from '../contexts/StoreContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { FileDown, TrendingUp, DollarSign, Package, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Relatorios() {
  const { vendas, movimentacoes, produtos } = useStore();
  const [periodoMes, setPeriodoMes] = useState(new Date().getMonth().toString());
  const [periodoAno, setPeriodoAno] = useState(new Date().getFullYear().toString());
  const [filtroCategoria, setFiltroCategoria] = useState<'todos' | 'original' | 'generico'>('todos');

  const mesAtual = parseInt(periodoMes);
  const anoAtual = parseInt(periodoAno);
  const dataInicio = startOfMonth(new Date(anoAtual, mesAtual, 1));
  const dataFim = endOfMonth(new Date(anoAtual, mesAtual, 1));

  const vendasPeriodo = vendas.filter((v) =>
    isWithinInterval(v.data, { start: dataInicio, end: dataFim })
  );

  const movimentacoesPeriodo = movimentacoes.filter((m) =>
    isWithinInterval(m.data, { start: dataInicio, end: dataFim })
  );

  // Filtrar por categoria se necessário
  const vendasFiltradas = filtroCategoria === 'todos'
    ? vendasPeriodo
    : vendasPeriodo.map((venda) => ({
        ...venda,
        itens: venda.itens.filter((item) => item.produto.categoria === filtroCategoria),
      })).filter((venda) => venda.itens.length > 0);

  const totalVendas = vendasFiltradas.reduce((acc, v) => {
    const totalVenda = v.itens.reduce((sum, item) => sum + item.produto.preco * item.quantidade, 0);
    return acc + totalVenda;
  }, 0);

  const quantidadeVendas = vendasFiltradas.length;

  const exportarRelatorioVendas = () => {
    const csv = [
      ['Data', 'Vendedor', 'Produto', 'Quantidade', 'Valor Unitário', 'Total', 'Categoria'],
      ...vendasFiltradas.flatMap((v) =>
        v.itens.map((item) => [
          format(v.data, 'dd/MM/yyyy HH:mm', { locale: ptBR }),
          v.vendedorNome,
          item.produto.nome,
          item.quantidade,
          item.produto.preco.toFixed(2),
          (item.produto.preco * item.quantidade).toFixed(2),
          item.produto.categoria,
        ])
      ),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendas_${format(dataInicio, 'yyyy-MM')}.csv`;
    a.click();

    toast.success('Relatório de vendas exportado!');
  };

  const exportarRelatorioMovimentacoes = () => {
    const csv = [
      ['Data', 'Tipo', 'Produto', 'Quantidade', 'Responsável'],
      ...movimentacoesPeriodo.map((m) => [
        format(m.data, 'dd/MM/yyyy HH:mm', { locale: ptBR }),
        m.tipo.toUpperCase(),
        m.produtoNome,
        m.quantidade,
        m.responsavel,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `movimentacoes_${format(dataInicio, 'yyyy-MM')}.csv`;
    a.click();

    toast.success('Relatório de movimentações exportado!');
  };

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  const anos = [2024, 2025, 2026];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Relatórios</h1>
            <p className="text-muted-foreground">Histórico de vendas e movimentações</p>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros de Período</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label>Mês</Label>
              <Select value={periodoMes} onValueChange={setPeriodoMes}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {meses.map((mes, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {mes}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 space-y-2">
              <Label>Ano</Label>
              <Select value={periodoAno} onValueChange={setPeriodoAno}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {anos.map((ano) => (
                    <SelectItem key={ano} value={ano.toString()}>
                      {ano}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 space-y-2">
              <Label>Categoria</Label>
              <Select value={filtroCategoria} onValueChange={(value: any) => setFiltroCategoria(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="original">Originais</SelectItem>
                  <SelectItem value="generico">Genéricos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: '#0E006D' }}>
                R$ {totalVendas.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {format(dataInicio, 'MMMM/yyyy', { locale: ptBR })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Quantidade de Vendas</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quantidadeVendas}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Vendas realizadas no período
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Movimentações</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{movimentacoesPeriodo.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Entradas, saídas e ajustes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Relatórios */}
        <Tabs defaultValue="vendas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="vendas">Vendas</TabsTrigger>
            <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
          </TabsList>

          <TabsContent value="vendas" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Histórico de Vendas</CardTitle>
                <Button
                  onClick={exportarRelatorioVendas}
                  disabled={vendasFiltradas.length === 0}
                  style={{ backgroundColor: '#0E006D' }}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>
              </CardHeader>
              <CardContent>
                {vendasFiltradas.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhuma venda encontrada</h3>
                    <p className="text-muted-foreground">
                      Não há vendas registradas no período selecionado
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Vendedor</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-center">Qtd.</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right">Valor Unit.</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendasFiltradas.flatMap((venda) =>
                        venda.itens.map((item, index) => (
                          <TableRow key={`${venda.id}-${index}`}>
                            <TableCell>
                              {format(venda.data, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </TableCell>
                            <TableCell>{venda.vendedorNome}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {item.produto.nome}
                                {item.receita && (
                                  <Badge variant="destructive" className="text-xs">
                                    Controlado
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{item.quantidade}</TableCell>
                            <TableCell>
                              <Badge variant={item.produto.categoria === 'original' ? 'secondary' : 'outline'}>
                                {item.produto.categoria === 'original' ? 'Original' : 'Genérico'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              R$ {item.produto.preco.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              R$ {(item.produto.preco * item.quantidade).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="movimentacoes" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Histórico de Movimentações</CardTitle>
                <Button
                  onClick={exportarRelatorioMovimentacoes}
                  disabled={movimentacoesPeriodo.length === 0}
                  style={{ backgroundColor: '#0E006D' }}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>
              </CardHeader>
              <CardContent>
                {movimentacoesPeriodo.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhuma movimentação encontrada</h3>
                    <p className="text-muted-foreground">
                      Não há movimentações registradas no período selecionado
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-center">Quantidade</TableHead>
                        <TableHead>Responsável</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movimentacoesPeriodo.map((mov) => (
                        <TableRow key={mov.id}>
                          <TableCell>
                            {format(mov.data, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                mov.tipo === 'entrada'
                                  ? 'default'
                                  : mov.tipo === 'saida'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                            >
                              {mov.tipo.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>{mov.produtoNome}</TableCell>
                          <TableCell className="text-center font-medium">
                            <span className={mov.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}>
                              {mov.tipo === 'entrada' ? '+' : '-'}{mov.quantidade}
                            </span>
                          </TableCell>
                          <TableCell>{mov.responsavel}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { useAuth } from './AuthContext';

export type TipoControle = 'controlado' | 'nao-controlado';
export type Categoria = 'original' | 'generico';
export type TipoReceita = 'B1' | 'A1' | 'A2';

export interface Produto {
  id: string;
  nome: string;
  principioAtivo: string;
  fabricante: string;
  lote: string;
  validade: Date;
  categoria: Categoria;
  tipoControle: TipoControle;
  estoque: number;
  estoqueMinimo: number;
  preco: number;
  encomenda?: boolean;
}

export interface ItemVenda {
  produto: Produto;
  quantidade: number;
  receita?: {
    tipoReceita: TipoReceita;
    numeroReceita: string;
    crmMedico: string;
  };
}

export interface Venda {
  id: string;
  data: Date;
  vendedorId: string;
  vendedorNome: string;
  itens: ItemVenda[];
  total: number;
}

export interface Movimentacao {
  id: string;
  tipo: 'entrada' | 'saida' | 'ajuste';
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  data: Date;
  responsavel: string;
}

interface StoreContextType {
  produtos: Produto[];
  vendas: Venda[];
  movimentacoes: Movimentacao[];
  adicionarProduto: (produto: Omit<Produto, 'id'>) => Promise<void>;
  atualizarProduto: (id: string, produto: Partial<Produto>) => void;
  registrarVenda: (venda: Omit<Venda, 'id' | 'data'>) => Promise<void>;
  adicionarEstoque: (produtoId: string, quantidade: number, responsavel: string) => Promise<void>;
  getProdutosAbaixoMinimo: () => Produto[];
  getProdutosProximosVencer: (dias: number) => Produto[];
  carregarDados: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Helper to parse LocalDate (YYYY-MM-DD) avoiding timezone shifts
const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Helper to format Date to LocalDate (YYYY-MM-DD)
const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helpers for localStorage persistence of prices and encomendas
const getPrecoFromStorage = (loteId: string): number => {
  const pricesStr = localStorage.getItem('produtos_precos');
  if (pricesStr) {
    const prices = JSON.parse(pricesStr);
    if (prices[loteId] !== undefined) {
      return prices[loteId];
    }
  }
  // Default fallback prices for initial seed data or demo purposes
  if (loteId === '1') return 8.50;
  if (loteId === '2') return 45.00;
  if (loteId === '3') return 6.90;
  if (loteId === '4') return 12.00;
  if (loteId === '5') return 85.00;
  return 10.00;
};

const savePrecoToStorage = (loteId: string, preco: number) => {
  const pricesStr = localStorage.getItem('produtos_precos') || '{}';
  const prices = JSON.parse(pricesStr);
  prices[loteId] = preco;
  localStorage.setItem('produtos_precos', JSON.stringify(prices));
};

const getEncomendaFromStorage = (loteId: string): boolean => {
  const encomendasStr = localStorage.getItem('produtos_encomendas');
  if (encomendasStr) {
    const encomendas = JSON.parse(encomendasStr);
    return !!encomendas[loteId];
  }
  return false;
};

const saveEncomendaToStorage = (loteId: string, encomenda: boolean) => {
  const encomendasStr = localStorage.getItem('produtos_encomendas') || '{}';
  const encomendas = JSON.parse(encomendasStr);
  encomendas[loteId] = encomenda;
  localStorage.setItem('produtos_encomendas', JSON.stringify(encomendas));
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const { isAuthenticated } = useAuth();

  const mapBackendVenda = (v: any, produtosList: Produto[]): Venda => {
    return {
      id: String(v.id),
      data: new Date(v.dataVenda),
      vendedorId: String(v.usuario?.id || ''),
      vendedorNome: v.usuario?.nome || '',
      total: v.valorTotal,
      itens: (v.itens || []).map((item: any) => {
        const prod = produtosList.find(p => p.id === String(item.lote?.id)) || {
          id: String(item.lote?.id || ''),
          nome: item.lote?.medicamento?.nome || 'Medicamento Desconhecido',
          principioAtivo: item.lote?.medicamento?.principioAtivo || '',
          fabricante: item.lote?.medicamento?.fabricante || '',
          lote: item.lote?.numeroLote || '',
          validade: new Date(item.lote?.dataValidade || Date.now()),
          categoria: (item.lote?.medicamento?.categoria || 'GENERICO').toLowerCase() as Categoria,
          tipoControle: (item.lote?.medicamento?.tipoControle || 'NAO_CONTROLADO').toLowerCase() === 'controlado' ? 'controlado' : 'nao-controlado',
          estoque: item.lote?.quantidadeAtual || 0,
          estoqueMinimo: item.lote?.medicamento?.estoqueMinimo || 5,
          preco: item.precoUnitario,
        };
        return {
          produto: prod,
          quantidade: item.quantidade,
          receita: v.receitaRegistro ? {
            tipoReceita: 'B1',
            numeroReceita: v.receitaRegistro,
            crmMedico: '',
          } : undefined
        };
      })
    };
  };

  const mapBackendMovimentacao = (m: any): Movimentacao => {
    return {
      id: String(m.id),
      tipo: m.tipo.toLowerCase() === 'entrada' ? 'entrada' : m.tipo.toLowerCase() === 'saida' ? 'saida' : 'ajuste',
      produtoId: String(m.lote?.id || ''),
      produtoNome: m.lote?.medicamento?.nome || 'Medicamento Desconhecido',
      quantidade: m.quantidade,
      data: new Date(m.dataHora),
      responsavel: m.usuario?.nome || 'Sistema',
    };
  };

  const carregarDados = async () => {
    if (!isAuthenticated) return;
    try {
      // 1. Fetch medicamentos
      const medicamentos: any[] = await apiRequest('/medicamentos');
      
      // 2. Fetch lotes for each medicamento
      const allProdutos: Produto[] = [];
      for (const med of medicamentos) {
        try {
          const lotes: any[] = await apiRequest(`/lotes/medicamento/${med.id}`);
          for (const lote of lotes) {
            allProdutos.push({
              id: String(lote.id),
              nome: med.nome,
              principioAtivo: med.principioAtivo,
              fabricante: med.fabricante,
              lote: lote.numeroLote,
              validade: parseLocalDate(lote.dataValidade),
              categoria: med.categoria.toLowerCase() as Categoria,
              tipoControle: med.tipoControle.toLowerCase() === 'controlado' ? 'controlado' : 'nao-controlado',
              estoque: lote.quantidadeAtual,
              estoqueMinimo: med.estoqueMinimo,
              preco: getPrecoFromStorage(String(lote.id)),
              encomenda: getEncomendaFromStorage(String(lote.id)),
            });
          }
        } catch (e) {
          console.error(`Erro ao carregar lotes do medicamento ${med.id}:`, e);
        }
      }
      setProdutos(allProdutos);

      // 3. Fetch sales
      const backendVendas: any[] = await apiRequest('/vendas');
      const mappedVendas = backendVendas.map(v => mapBackendVenda(v, allProdutos));
      setVendas(mappedVendas);

      // 4. Fetch movements
      const backendMovs: any[] = await apiRequest('/movimentacoes/historico');
      const mappedMovs = backendMovs.map(mapBackendMovimentacao);
      setMovimentacoes(mappedMovs);
    } catch (error) {
      console.error('Erro ao carregar dados do backend:', error);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [isAuthenticated]);

  const adicionarProduto = async (novoProduto: Omit<Produto, 'id'>) => {
    try {
      const payload = {
        nome: novoProduto.nome,
        principioAtivo: novoProduto.principioAtivo,
        fabricante: novoProduto.fabricante,
        categoria: novoProduto.categoria.toUpperCase(),
        tipoControle: novoProduto.tipoControle === 'controlado' ? 'CONTROLADO' : 'NAO_CONTROLADO',
        numeroLote: novoProduto.lote,
        dataValidade: formatLocalDate(novoProduto.validade),
        quantidadeInicial: novoProduto.estoque,
        estoqueMinimo: novoProduto.estoqueMinimo,
      };

      const med = await apiRequest('/medicamentos', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // Fetch the newly created lote for this medicamento to get its database ID
      const lotes = await apiRequest(`/lotes/medicamento/${med.id}`);
      const createdLote = lotes.find((l: any) => l.numeroLote === novoProduto.lote) || lotes[0];
      
      if (createdLote) {
        savePrecoToStorage(String(createdLote.id), novoProduto.preco);
        saveEncomendaToStorage(String(createdLote.id), !!novoProduto.encomenda);
      }

      await carregarDados();
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      throw error;
    }
  };

  const atualizarProduto = (id: string, atualizacao: Partial<Produto>) => {
    if (atualizacao.encomenda !== undefined) {
      saveEncomendaToStorage(id, atualizacao.encomenda);
    }
    if (atualizacao.preco !== undefined) {
      savePrecoToStorage(id, atualizacao.preco);
    }
    
    // Update local state directly
    setProdutos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...atualizacao } : p))
    );
  };

  const registrarVenda = async (venda: Omit<Venda, 'id' | 'data'>) => {
    try {
      const firstItemWithReceita = venda.itens.find(item => item.receita);
      const receitaRegistro = firstItemWithReceita?.receita 
        ? `${firstItemWithReceita.receita.tipoReceita}-${firstItemWithReceita.receita.numeroReceita} (CRM: ${firstItemWithReceita.receita.crmMedico})`
        : undefined;

      const payload = {
        itens: venda.itens.map((item) => ({
          loteId: Number(item.produto.id),
          quantidade: item.quantidade,
          precoUnitario: item.produto.preco,
        })),
        receitaRegistro,
        encomenda: false,
      };

      await apiRequest('/vendas', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      await carregarDados();
    } catch (error) {
      console.error('Erro ao registrar venda:', error);
      throw error;
    }
  };

  const adicionarEstoque = async (
    produtoId: string,
    quantidade: number,
    responsavel: string
  ) => {
    try {
      await apiRequest('/movimentacoes/entrada', {
        method: 'POST',
        body: JSON.stringify({
          loteId: Number(produtoId),
          quantidade,
          observacao: `Entrada manual por ${responsavel}`,
        }),
      });

      await carregarDados();
    } catch (error) {
      console.error('Erro ao adicionar estoque:', error);
      throw error;
    }
  };

  const getProdutosAbaixoMinimo = () => {
    return produtos.filter(
      (p) => p.estoque < p.estoqueMinimo && !p.encomenda
    );
  };

  const getProdutosProximosVencer = (dias: number) => {
    const hoje = new Date();
    const limite = new Date();
    limite.setDate(hoje.getDate() + dias);

    return produtos.filter((p) => p.validade <= limite);
  };

  return (
    <StoreContext.Provider
      value={{
        produtos,
        vendas,
        movimentacoes,
        adicionarProduto,
        atualizarProduto,
        registrarVenda,
        adicionarEstoque,
        getProdutosAbaixoMinimo,
        getProdutosProximosVencer,
        carregarDados,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
}

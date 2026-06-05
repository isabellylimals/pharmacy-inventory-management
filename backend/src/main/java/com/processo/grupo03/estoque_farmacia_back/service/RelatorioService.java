package com.processo.grupo03.estoque_farmacia_back.service;

import com.processo.grupo03.estoque_farmacia_back.enums.CategoriaMedicamento;
import com.processo.grupo03.estoque_farmacia_back.model.ItemVenda;
import com.processo.grupo03.estoque_farmacia_back.model.Medicamento;
import com.processo.grupo03.estoque_farmacia_back.model.Venda;
import com.processo.grupo03.estoque_farmacia_back.repository.ItemVendaRepository;
import com.processo.grupo03.estoque_farmacia_back.repository.MedicamentoRepository;
import com.processo.grupo03.estoque_farmacia_back.repository.VendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RelatorioService {

    @Autowired
    private VendaRepository vendaRepository;

    @Autowired
    private MedicamentoRepository medicamentoRepository;

    @Autowired
    private ItemVendaRepository itemVendaRepository;

    @Autowired
    private MedicamentoService medicamentoService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    // RF17: Gerar relatório mensal
    public String gerarRelatorioMensal(int mes, int ano) {
        LocalDateTime inicio = LocalDateTime.of(ano, mes, 1, 0, 0, 0);
        LocalDateTime fim = inicio.plusMonths(1).minusSeconds(1);

        List<Venda> vendas = vendaRepository.findVendasAtivasNoPeriodo(inicio, fim);
        List<Object[]> maisVendidos = itemVendaRepository.findProdutosMaisVendidos(inicio, fim);

        StringBuilder relatorio = new StringBuilder();

        relatorio.append("     RELATÓRIO MENSAL - ")
                .append(String.format("%02d/%d", mes, ano)).append("\n");
      
        relatorio.append("Período: ").append(inicio.format(DATE_FORMATTER))
                .append(" a ").append(fim.format(DATE_FORMATTER)).append("\n\n");
        relatorio.append("Total de Vendas: ").append(vendas.size()).append("\n");
        relatorio.append("Valor Total: R$ ")
                .append(String.format("%.2f", vendas.stream().mapToDouble(Venda::getValorTotal).sum()))
                .append("\n\n");
        relatorio.append("Produtos Mais Vendidos\n");

        for (Object[] item : maisVendidos) {
            relatorio.append("- ").append(item[0]).append(": ")
                    .append(item[1]).append(" unidades\n");
        }

        return relatorio.toString();
    }

    // RF19: Filtrar apenas medicamentos originais
    public List<Venda> filtrarPorCategoriaOriginal(List<Venda> vendas) {
        return vendas.stream()
                .filter(venda -> venda.getItens().stream()
                        .anyMatch(item -> item.getLote().getMedicamento().getCategoria() == CategoriaMedicamento.ORIGINAL))
                .collect(Collectors.toList());
    }

    // RF20: Listar itens em falta (estoque baixo)
    public List<Medicamento> listarItensEmFalta() {
        return medicamentoService.listarEstoqueBaixo();
    }

    // RF21: Exportar relatório para CSV
    public String exportarRelatorioCSV(LocalDateTime inicio, LocalDateTime fim) {
        List<Venda> vendas = vendaRepository.findVendasAtivasNoPeriodo(inicio, fim);

        StringBuilder csv = new StringBuilder();
        csv.append("ID Venda;Data;Vendedor;Valor Total;Encomenda;Cancelada;Itens\n");

        for (Venda venda : vendas) {
            String itens = venda.getItens().stream()
                    .map(item -> item.getLote().getMedicamento().getNome() + " x" + item.getQuantidade())
                    .collect(Collectors.joining(" | "));

            csv.append(venda.getId()).append(";")
               .append(venda.getDataVenda().format(DATE_FORMATTER)).append(";")
               .append(venda.getUsuario().getNome()).append(";")
               .append(venda.getValorTotal()).append(";")
               .append(venda.getEncomenda() ? "Sim" : "Não").append(";")
               .append(venda.getCancelada() ? "Sim" : "Não").append(";")
               .append(itens).append("\n");
        }

        return csv.toString();
    }
}
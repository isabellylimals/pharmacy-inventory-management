package com.processo.grupo03.estoque_farmacia_back.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lotes")
public class Lote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_lote", nullable = false, unique = true, length = 50)
    private String numeroLote;

    @Column(name = "data_validade", nullable = false)
    private LocalDate dataValidade;

    @Column(name = "quantidade_inicial", nullable = false)
    private Integer quantidadeInicial;

    @Column(name = "quantidade_atual", nullable = false)
    private Integer quantidadeAtual;

    @Column(name = "data_fabricacao")
    private LocalDate dataFabricacao;

    @Column(name = "data_entrada")
    private LocalDateTime dataEntrada;

    @ManyToOne
    @JoinColumn(name = "medicamento_id", nullable = false)
    @JsonIgnore
    private Medicamento medicamento;

    @OneToMany(mappedBy = "lote")
    @JsonIgnore
    private List<ItemVenda> itensVenda = new ArrayList<>();

    @OneToMany(mappedBy = "lote")
    @JsonIgnore
    private List<MovimentacaoEstoque> movimentacoes = new ArrayList<>();

    // Construtores
    public Lote() {}

    public Lote(String numeroLote, LocalDate dataValidade, Integer quantidade, Medicamento medicamento) {
        this.numeroLote = numeroLote;
        this.dataValidade = dataValidade;
        this.quantidadeInicial = quantidade;
        this.quantidadeAtual = quantidade;
        this.medicamento = medicamento;
        this.dataEntrada = LocalDateTime.now();
    }

    // Métodos de validação
    public boolean isVencido() {
        return LocalDate.now().isAfter(dataValidade);
    }

    public boolean isProximoVencimento(int diasAviso) {
        return LocalDate.now().plusDays(diasAviso).isAfter(dataValidade) && !isVencido();
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNumeroLote() { return numeroLote; }
    public void setNumeroLote(String numeroLote) { this.numeroLote = numeroLote; }

    public LocalDate getDataValidade() { return dataValidade; }
    public void setDataValidade(LocalDate dataValidade) { this.dataValidade = dataValidade; }

    public Integer getQuantidadeInicial() { return quantidadeInicial; }
    public void setQuantidadeInicial(Integer quantidadeInicial) { this.quantidadeInicial = quantidadeInicial; }

    public Integer getQuantidadeAtual() { return quantidadeAtual; }
    public void setQuantidadeAtual(Integer quantidadeAtual) { this.quantidadeAtual = quantidadeAtual; }

    public LocalDate getDataFabricacao() { return dataFabricacao; }
    public void setDataFabricacao(LocalDate dataFabricacao) { this.dataFabricacao = dataFabricacao; }

    public LocalDateTime getDataEntrada() { return dataEntrada; }
    public void setDataEntrada(LocalDateTime dataEntrada) { this.dataEntrada = dataEntrada; }

    public Medicamento getMedicamento() { return medicamento; }
    public void setMedicamento(Medicamento medicamento) { this.medicamento = medicamento; }

    public List<ItemVenda> getItensVenda() { return itensVenda; }
    public void setItensVenda(List<ItemVenda> itensVenda) { this.itensVenda = itensVenda; }

    public List<MovimentacaoEstoque> getMovimentacoes() { return movimentacoes; }
    public void setMovimentacoes(List<MovimentacaoEstoque> movimentacoes) { this.movimentacoes = movimentacoes; }
}
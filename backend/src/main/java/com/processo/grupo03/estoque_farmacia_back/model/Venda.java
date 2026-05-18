package com.processo.grupo03.estoque_farmacia_back.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vendas")
public class Venda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "data_venda", nullable = false)
    private LocalDateTime dataVenda;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "valor_total", nullable = false)
    private Double valorTotal;

    @Column(name = "receita_registro", length = 100)
    private String receitaRegistro;

    @Column(name = "encomenda")
    private Boolean encomenda = false;

    @Column(name = "cancelada")
    private Boolean cancelada = false;

    @Column(name = "data_cancelamento")
    private LocalDateTime dataCancelamento;

    @OneToMany(mappedBy = "venda", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ItemVenda> itens = new ArrayList<>();


    public Venda() {}

    public Venda(Usuario usuario, Double valorTotal) {
        this.dataVenda = LocalDateTime.now();
        this.usuario = usuario;
        this.valorTotal = valorTotal;
        this.encomenda = false;
        this.cancelada = false;
    }

    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getDataVenda() { return dataVenda; }
    public void setDataVenda(LocalDateTime dataVenda) { this.dataVenda = dataVenda; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public Double getValorTotal() { return valorTotal; }
    public void setValorTotal(Double valorTotal) { this.valorTotal = valorTotal; }

    public String getReceitaRegistro() { return receitaRegistro; }
    public void setReceitaRegistro(String receitaRegistro) { this.receitaRegistro = receitaRegistro; }

    public Boolean getEncomenda() { return encomenda; }
    public void setEncomenda(Boolean encomenda) { this.encomenda = encomenda; }

    public Boolean getCancelada() { return cancelada; }
    public void setCancelada(Boolean cancelada) { this.cancelada = cancelada; }

    public LocalDateTime getDataCancelamento() { return dataCancelamento; }
    public void setDataCancelamento(LocalDateTime dataCancelamento) { this.dataCancelamento = dataCancelamento; }

    public List<ItemVenda> getItens() { return itens; }
    public void setItens(List<ItemVenda> itens) { this.itens = itens; }
}
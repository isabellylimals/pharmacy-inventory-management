package com.processo.grupo03.estoque_farmacia_back.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "itens_venda")
public class ItemVenda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "venda_id", nullable = false)
    @JsonIgnore  // ← ADICIONE ISSO para evitar loop
    private Venda venda;

    @ManyToOne
    @JoinColumn(name = "lote_id", nullable = false)
    private Lote lote;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(name = "preco_unitario", nullable = false)
    private Double precoUnitario;

    @Column(name = "subtotal", nullable = false)
    private Double subtotal;

    // Construtores
    public ItemVenda() {}

    public ItemVenda(Venda venda, Lote lote, Integer quantidade, Double precoUnitario) {
        this.venda = venda;
        this.lote = lote;
        this.quantidade = quantidade;
        this.precoUnitario = precoUnitario;
        this.subtotal = quantidade * precoUnitario;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Venda getVenda() { return venda; }
    public void setVenda(Venda venda) { this.venda = venda; }

    public Lote getLote() { return lote; }
    public void setLote(Lote lote) { this.lote = lote; }

    public Integer getQuantidade() { return quantidade; }
    public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }

    public Double getPrecoUnitario() { return precoUnitario; }
    public void setPrecoUnitario(Double precoUnitario) { this.precoUnitario = precoUnitario; }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }
}
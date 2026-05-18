package com.processo.grupo03.estoque_farmacia_back.dtos;

public class ItemVendaResponseDTO {
    private String medicamentoNome;
    private String numeroLote;
    private Integer quantidade;
    private Double precoUnitario;
    private Double subtotal;


    public String getMedicamentoNome() { return medicamentoNome; }
    public void setMedicamentoNome(String medicamentoNome) { this.medicamentoNome = medicamentoNome; }

    public String getNumeroLote() { return numeroLote; }
    public void setNumeroLote(String numeroLote) { this.numeroLote = numeroLote; }

    public Integer getQuantidade() { return quantidade; }
    public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }

    public Double getPrecoUnitario() { return precoUnitario; }
    public void setPrecoUnitario(Double precoUnitario) { this.precoUnitario = precoUnitario; }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }
}
package com.processo.grupo03.estoque_farmacia_back.dtos;

import java.time.LocalDateTime;
import java.util.List;

public class VendaResponseDTO {
    private Long id;
    private LocalDateTime dataVenda;
    private String vendedor;
    private Double valorTotal;
    private Boolean encomenda;
    private String receitaRegistro;
    private List<ItemVendaResponseDTO> itens;

  
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getDataVenda() { return dataVenda; }
    public void setDataVenda(LocalDateTime dataVenda) { this.dataVenda = dataVenda; }

    public String getVendedor() { return vendedor; }
    public void setVendedor(String vendedor) { this.vendedor = vendedor; }

    public Double getValorTotal() { return valorTotal; }
    public void setValorTotal(Double valorTotal) { this.valorTotal = valorTotal; }

    public Boolean getEncomenda() { return encomenda; }
    public void setEncomenda(Boolean encomenda) { this.encomenda = encomenda; }

    public String getReceitaRegistro() { return receitaRegistro; }
    public void setReceitaRegistro(String receitaRegistro) { this.receitaRegistro = receitaRegistro; }

    public List<ItemVendaResponseDTO> getItens() { return itens; }
    public void setItens(List<ItemVendaResponseDTO> itens) { this.itens = itens; }
}
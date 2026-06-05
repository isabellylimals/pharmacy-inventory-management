package com.processo.grupo03.estoque_farmacia_back.dtos;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public class VendaRequestDTO {

    @NotNull(message = "Itens da venda são obrigatórios")
    private List<ItemVendaDTO> itens;

    private String receitaRegistro; 

    private Boolean encomenda = false; 

    
    public List<ItemVendaDTO> getItens() { return itens; }
    public void setItens(List<ItemVendaDTO> itens) { this.itens = itens; }

    public String getReceitaRegistro() { return receitaRegistro; }
    public void setReceitaRegistro(String receitaRegistro) { this.receitaRegistro = receitaRegistro; }

    public Boolean getEncomenda() { return encomenda; }
    public void setEncomenda(Boolean encomenda) { this.encomenda = encomenda; }
}
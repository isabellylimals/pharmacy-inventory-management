package com.processo.grupo03.estoque_farmacia_back.dtos;

import com.processo.grupo03.estoque_farmacia_back.enums.CategoriaMedicamento;
import com.processo.grupo03.estoque_farmacia_back.enums.TipoControle;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class MedicamentoRequestDTO {
    
    @NotBlank(message = "Nome é obrigatório")
    private String nome;
    
    @NotBlank(message = "Princípio ativo é obrigatório")
    private String principioAtivo;
    
    @NotBlank(message = "Fabricante é obrigatório")
    private String fabricante;
    
    @NotNull(message = "Categoria é obrigatória")
    private CategoriaMedicamento categoria;
    
    @NotNull(message = "Tipo de controle é obrigatório")
    private TipoControle tipoControle;
    
    @NotBlank(message = "Número do lote é obrigatório")
    private String numeroLote;
    
    @NotNull(message = "Data de validade é obrigatória")
    private LocalDate dataValidade;
    
    @NotNull(message = "Quantidade inicial é obrigatória")
    private Integer quantidadeInicial;
    
    private Integer estoqueMinimo = 5;
    
    // Getters e Setters
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    
    public String getPrincipioAtivo() { return principioAtivo; }
    public void setPrincipioAtivo(String principioAtivo) { this.principioAtivo = principioAtivo; }
    
    public String getFabricante() { return fabricante; }
    public void setFabricante(String fabricante) { this.fabricante = fabricante; }
    
    public CategoriaMedicamento getCategoria() { return categoria; }
    public void setCategoria(CategoriaMedicamento categoria) { this.categoria = categoria; }
    
    public TipoControle getTipoControle() { return tipoControle; }
    public void setTipoControle(TipoControle tipoControle) { this.tipoControle = tipoControle; }
    
    public String getNumeroLote() { return numeroLote; }
    public void setNumeroLote(String numeroLote) { this.numeroLote = numeroLote; }
    
    public LocalDate getDataValidade() { return dataValidade; }
    public void setDataValidade(LocalDate dataValidade) { this.dataValidade = dataValidade; }
    
    public Integer getQuantidadeInicial() { return quantidadeInicial; }
    public void setQuantidadeInicial(Integer quantidadeInicial) { this.quantidadeInicial = quantidadeInicial; }
    
    public Integer getEstoqueMinimo() { return estoqueMinimo; }
    public void setEstoqueMinimo(Integer estoqueMinimo) { this.estoqueMinimo = estoqueMinimo; }
}
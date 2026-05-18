package com.processo.grupo03.estoque_farmacia_back.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.processo.grupo03.estoque_farmacia_back.enums.CategoriaMedicamento;
import com.processo.grupo03.estoque_farmacia_back.enums.TipoControle;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "medicamentos")
public class Medicamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(name = "principio_ativo", nullable = false, length = 100)
    private String principioAtivo;

    @Column(nullable = false, length = 100)
    private String fabricante;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategoriaMedicamento categoria;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_controle", nullable = false)
    private TipoControle tipoControle;

    @Column(name = "estoque_minimo")
    private Integer estoqueMinimo = 5;

    @Column(name = "data_cadastro")
    private LocalDateTime dataCadastro;

    private Boolean ativo = true;

    @OneToMany(mappedBy = "medicamento", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Lote> lotes = new ArrayList<>();

 
    public Medicamento() {}

    public Medicamento(String nome, String principioAtivo, String fabricante, 
                       CategoriaMedicamento categoria, TipoControle tipoControle) {
        this.nome = nome;
        this.principioAtivo = principioAtivo;
        this.fabricante = fabricante;
        this.categoria = categoria;
        this.tipoControle = tipoControle;
        this.dataCadastro = LocalDateTime.now();
        this.ativo = true;
    }

    public Integer getEstoqueTotal() {
        return lotes.stream()
                .filter(lote -> lote.getQuantidadeAtual() > 0)
                .mapToInt(Lote::getQuantidadeAtual)
                .sum();
    }

    public boolean isEstoqueBaixo() {
        return getEstoqueTotal() <= estoqueMinimo;
    }

  
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public Integer getEstoqueMinimo() { return estoqueMinimo; }
    public void setEstoqueMinimo(Integer estoqueMinimo) { this.estoqueMinimo = estoqueMinimo; }

    public LocalDateTime getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(LocalDateTime dataCadastro) { this.dataCadastro = dataCadastro; }

    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }

    public List<Lote> getLotes() { return lotes; }
    public void setLotes(List<Lote> lotes) { this.lotes = lotes; }
}
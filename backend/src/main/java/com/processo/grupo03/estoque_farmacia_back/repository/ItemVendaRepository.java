package com.processo.grupo03.estoque_farmacia_back.repository;

import com.processo.grupo03.estoque_farmacia_back.model.ItemVenda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ItemVendaRepository extends JpaRepository<ItemVenda, Long> {
    
    List<ItemVenda> findByVendaId(Long vendaId);
    
    @Query("SELECT i.lote.medicamento.nome as medicamentoNome, SUM(i.quantidade) as totalVendido " +
           "FROM ItemVenda i WHERE i.venda.cancelada = false AND i.venda.dataVenda BETWEEN :inicio AND :fim " +
           "GROUP BY i.lote.medicamento.nome ORDER BY totalVendido DESC")
    List<Object[]> findProdutosMaisVendidos(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);
}
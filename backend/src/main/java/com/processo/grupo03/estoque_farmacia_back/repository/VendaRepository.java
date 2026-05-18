package com.processo.grupo03.estoque_farmacia_back.repository;

import com.processo.grupo03.estoque_farmacia_back.model.Venda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VendaRepository extends JpaRepository<Venda, Long> {
    
    List<Venda> findByDataVendaBetween(LocalDateTime inicio, LocalDateTime fim);
    
    List<Venda> findByUsuarioId(Long usuarioId);
    
    List<Venda> findByEncomendaTrue();
    
    List<Venda> findByCanceladaFalse();
    
    @Query("SELECT v FROM Venda v WHERE v.cancelada = false AND v.dataVenda BETWEEN :inicio AND :fim")
    List<Venda> findVendasAtivasNoPeriodo(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);
}
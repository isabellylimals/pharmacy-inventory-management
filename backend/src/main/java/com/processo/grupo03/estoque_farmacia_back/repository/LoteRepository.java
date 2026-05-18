package com.processo.grupo03.estoque_farmacia_back.repository;

import com.processo.grupo03.estoque_farmacia_back.model.Lote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoteRepository extends JpaRepository<Lote, Long> {
    
    List<Lote> findByMedicamentoId(Long medicamentoId);
    
    List<Lote> findByDataValidadeBefore(LocalDate data);
    
    List<Lote> findByDataValidadeBetween(LocalDate inicio, LocalDate fim);
    
    List<Lote> findByQuantidadeAtualGreaterThan(Integer quantidade);
    
    @Query("SELECT l FROM Lote l WHERE l.dataValidade <= :data AND l.quantidadeAtual > 0")
    List<Lote> findLotesVencidosComEstoque(@Param("data") LocalDate data);
    
    @Query("SELECT l FROM Lote l WHERE l.dataValidade BETWEEN :inicio AND :fim AND l.quantidadeAtual > 0")
    List<Lote> findLotesProximosVencimento(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);
    // Adicione este método
    Optional<Lote> findByNumeroLote(String numeroLote);
}
package com.processo.grupo03.estoque_farmacia_back.repository;

import com.processo.grupo03.estoque_farmacia_back.enums.CategoriaMedicamento;
import com.processo.grupo03.estoque_farmacia_back.model.Medicamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MedicamentoRepository extends JpaRepository<Medicamento, Long> {
    
    List<Medicamento> findByNomeContainingIgnoreCase(String nome);
    
    List<Medicamento> findByPrincipioAtivoContainingIgnoreCase(String principioAtivo);
    
    List<Medicamento> findByAtivoTrue();
    
    List<Medicamento> findByCategoria(CategoriaMedicamento categoria);
    
    // RF07, RF20: Listar medicamentos com estoque baixo
    @Query("SELECT m FROM Medicamento m WHERE m.ativo = true AND m.estoqueMinimo >= (SELECT COALESCE(SUM(l.quantidadeAtual), 0) FROM Lote l WHERE l.medicamento = m)")
    List<Medicamento> findMedicamentosComEstoqueBaixo();
}
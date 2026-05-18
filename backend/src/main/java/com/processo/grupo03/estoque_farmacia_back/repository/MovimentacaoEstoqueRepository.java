package com.processo.grupo03.estoque_farmacia_back.repository;

import com.processo.grupo03.estoque_farmacia_back.model.MovimentacaoEstoque;
import com.processo.grupo03.estoque_farmacia_back.model.Usuario;
import com.processo.grupo03.estoque_farmacia_back.enums.TipoMovimentacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MovimentacaoEstoqueRepository extends JpaRepository<MovimentacaoEstoque, Long> {
    List<MovimentacaoEstoque> findByUsuario(Usuario usuario);
    List<MovimentacaoEstoque> findByTipo(TipoMovimentacao tipo);
    List<MovimentacaoEstoque> findByDataHoraBetween(LocalDateTime inicio, LocalDateTime fim);
}
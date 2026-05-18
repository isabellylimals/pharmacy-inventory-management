package com.processo.grupo03.estoque_farmacia_back.controller;

import com.processo.grupo03.estoque_farmacia_back.dtos.EntradaEstoqueDTO;
import com.processo.grupo03.estoque_farmacia_back.dtos.SaidaEstoqueDTO;
import com.processo.grupo03.estoque_farmacia_back.enums.TipoMovimentacao;
import com.processo.grupo03.estoque_farmacia_back.model.MovimentacaoEstoque;
import com.processo.grupo03.estoque_farmacia_back.service.MovimentacaoEstoqueService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/movimentacoes")
@CrossOrigin(origins = "*")
public class MovimentacaoEstoqueController {

    @Autowired
    private MovimentacaoEstoqueService movimentacaoService;

    // RF02: Registrar entrada (só ADMIN)
    @PostMapping("/entrada")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MovimentacaoEstoque> registrarEntrada(@Valid @RequestBody EntradaEstoqueDTO dto) {
        MovimentacaoEstoque movimentacao = movimentacaoService.registrarEntrada(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(movimentacao);
    }

    // RF11: Registrar saída/venda (ADMIN e ATENDENTE)
    @PostMapping("/saida")
    @PreAuthorize("hasAnyRole('ADMIN', 'ATENDENTE')")
    public ResponseEntity<MovimentacaoEstoque> registrarSaida(@Valid @RequestBody SaidaEstoqueDTO dto) {
        MovimentacaoEstoque movimentacao = movimentacaoService.registrarSaida(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(movimentacao);
    }

    // RF10: Listar histórico de movimentações
    @GetMapping("/historico")
    @PreAuthorize("hasAnyRole('ADMIN', 'ATENDENTE')")
    public ResponseEntity<List<MovimentacaoEstoque>> listarHistorico(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        return ResponseEntity.ok(movimentacaoService.listarHistorico(inicio, fim));
    }

    // Listar por tipo
    @GetMapping("/tipo/{tipo}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ATENDENTE')")
    public ResponseEntity<List<MovimentacaoEstoque>> listarPorTipo(@PathVariable TipoMovimentacao tipo) {
        return ResponseEntity.ok(movimentacaoService.listarPorTipo(tipo));
    }

    // Listar por usuário
    @GetMapping("/usuario/{usuarioId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<MovimentacaoEstoque>> listarPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(movimentacaoService.listarPorUsuario(usuarioId));
    }
}
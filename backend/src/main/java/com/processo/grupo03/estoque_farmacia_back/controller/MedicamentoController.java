package com.processo.grupo03.estoque_farmacia_back.controller;

import com.processo.grupo03.estoque_farmacia_back.dtos.MedicamentoRequestDTO;
import com.processo.grupo03.estoque_farmacia_back.enums.CategoriaMedicamento;
import com.processo.grupo03.estoque_farmacia_back.model.Medicamento;
import com.processo.grupo03.estoque_farmacia_back.service.MedicamentoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/medicamentos")
@CrossOrigin(origins = "*")
public class MedicamentoController {
    
    @Autowired
    private MedicamentoService medicamentoService;
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Medicamento> cadastrar(@Valid @RequestBody MedicamentoRequestDTO dto) {
        Medicamento medicamento = medicamentoService.cadastrarMedicamento(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(medicamento);
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ATENDENTE')")
    public ResponseEntity<List<Medicamento>> listarTodos() {
        return ResponseEntity.ok(medicamentoService.listarTodos());
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ATENDENTE')")
    public ResponseEntity<Medicamento> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(medicamentoService.buscarPorId(id));
    }
    
    @GetMapping("/buscar/nome")
    @PreAuthorize("hasAnyRole('ADMIN', 'ATENDENTE')")
    public ResponseEntity<List<Medicamento>> buscarPorNome(@RequestParam String nome) {
        return ResponseEntity.ok(medicamentoService.buscarPorNome(nome));
    }
    
    @GetMapping("/buscar/principio-ativo")
    @PreAuthorize("hasAnyRole('ADMIN', 'ATENDENTE')")
    public ResponseEntity<List<Medicamento>> buscarPorPrincipioAtivo(@RequestParam String principioAtivo) {
        return ResponseEntity.ok(medicamentoService.buscarPorPrincipioAtivo(principioAtivo));
    }
    
    // RF07: Listar medicamentos com estoque baixo
    @GetMapping("/estoque-baixo")
    @PreAuthorize("hasAnyRole('ADMIN', 'ATENDENTE')")
    public ResponseEntity<List<Medicamento>> listarEstoqueBaixo() {
        return ResponseEntity.ok(medicamentoService.listarEstoqueBaixo());
    }
    
    // RF06: Obter estoque total de um medicamento
    @GetMapping("/{id}/estoque-total")
    @PreAuthorize("hasAnyRole('ADMIN', 'ATENDENTE')")
    public ResponseEntity<Map<String, Object>> getEstoqueTotal(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        response.put("medicamentoId", id);
        response.put("estoqueTotal", medicamentoService.getEstoqueTotal(id));
        response.put("estoqueMinimo", medicamentoService.buscarPorId(id).getEstoqueMinimo());
        response.put("estoqueBaixo", medicamentoService.isEstoqueBaixo(id));
        return ResponseEntity.ok(response);
    }
    
    // RF19: Filtrar por categoria
    @GetMapping("/categoria/{categoria}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ATENDENTE')")
    public ResponseEntity<List<Medicamento>> listarPorCategoria(@PathVariable CategoriaMedicamento categoria) {
        return ResponseEntity.ok(medicamentoService.listarPorCategoria(categoria));
    }
    
    // RF08: Gerar lista de reposição automática (só ADMIN)
    @GetMapping("/reposicao")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<Medicamento, Integer>> gerarListaReposicao() {
        return ResponseEntity.ok(medicamentoService.gerarListaReposicao());
    }
}
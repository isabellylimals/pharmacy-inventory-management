package com.processo.grupo03.estoque_farmacia_back.controller;

import com.processo.grupo03.estoque_farmacia_back.model.Lote;
import com.processo.grupo03.estoque_farmacia_back.service.LoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/lotes")
@CrossOrigin(origins = "*")
public class LoteController {

    @Autowired
    private LoteService loteService;

    // Listar todos os lotes
    @GetMapping
    public ResponseEntity<List<Lote>> listarTodos() {
        return ResponseEntity.ok(loteService.listarTodos());
    }

    // Buscar lote por ID
    @GetMapping("/{id}")
    public ResponseEntity<Lote> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(loteService.buscarPorId(id));
    }

    // Listar lotes por medicamento
    @GetMapping("/medicamento/{medicamentoId}")
    public ResponseEntity<List<Lote>> listarPorMedicamento(@PathVariable Long medicamentoId) {
        return ResponseEntity.ok(loteService.listarPorMedicamento(medicamentoId));
    }

    // RF05: Listar lotes vencidos
    @GetMapping("/vencidos")
    public ResponseEntity<List<Lote>> listarVencidos() {
        return ResponseEntity.ok(loteService.listarVencidos());
    }

    // RF05: Listar lotes próximos do vencimento
    @GetMapping("/proximos-vencimento")
    public ResponseEntity<List<Lote>> listarProximosVencimento(@RequestParam int dias) {
        return ResponseEntity.ok(loteService.listarProximosVencimento(dias));
    }

    // RF02, RF03: Adicionar estoque a um lote
    @PutMapping("/{loteId}/adicionar-estoque")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Lote> adicionarEstoque(@PathVariable Long loteId, @RequestParam int quantidade) {
        Lote lote = loteService.adicionarEstoque(loteId, quantidade);
        return ResponseEntity.ok(lote);
    }

    // RF03, RF11: Remover estoque de um lote
    @PutMapping("/{loteId}/remover-estoque")
    @PreAuthorize("hasAnyRole('ADMIN', 'ATENDENTE')")
    public ResponseEntity<Lote> removerEstoque(@PathVariable Long loteId, @RequestParam int quantidade) {
        Lote lote = loteService.removerEstoque(loteId, quantidade);
        return ResponseEntity.ok(lote);
    }

    // Verificar se lote está vencido
    @GetMapping("/{id}/verificar-vencido")
    public ResponseEntity<Map<String, Object>> verificarVencido(@PathVariable Long id) {
        Lote lote = loteService.buscarPorId(id);
        Map<String, Object> response = new HashMap<>();
        response.put("loteId", lote.getId());
        response.put("numeroLote", lote.getNumeroLote());
        response.put("dataValidade", lote.getDataValidade());
        response.put("vencido", loteService.isVencido(lote));
        return ResponseEntity.ok(response);
    }
}
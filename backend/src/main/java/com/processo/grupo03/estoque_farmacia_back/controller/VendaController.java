package com.processo.grupo03.estoque_farmacia_back.controller;

import com.processo.grupo03.estoque_farmacia_back.dtos.VendaRequestDTO;
import com.processo.grupo03.estoque_farmacia_back.dtos.VendaResponseDTO;
import com.processo.grupo03.estoque_farmacia_back.model.Venda;
import com.processo.grupo03.estoque_farmacia_back.service.VendaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/vendas")
@CrossOrigin(origins = "*")
public class VendaController {

    @Autowired
    private VendaService vendaService;

    // RF11: Registrar venda
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ATENDENTE')")
    public ResponseEntity<VendaResponseDTO> registrarVenda(@Valid @RequestBody VendaRequestDTO request) {
        VendaResponseDTO venda = vendaService.registrarVenda(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(venda);
    }

    // RF16: Cancelar venda
    @PutMapping("/{id}/cancelar")
    @PreAuthorize("hasAnyRole('ADMIN', 'ATENDENTE')")
    public ResponseEntity<VendaResponseDTO> cancelarVenda(@PathVariable Long id) {
        VendaResponseDTO venda = vendaService.cancelarVenda(id);
        return ResponseEntity.ok(venda);
    }

    // RF09: Marcar como encomenda
    @PutMapping("/{id}/encomenda")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Venda> marcarComoEncomenda(@PathVariable Long id) {
        Venda venda = vendaService.marcarComoEncomenda(id);
        return ResponseEntity.ok(venda);
    }

    // RF15: Gerar comprovante
    @GetMapping(value = "/{id}/comprovante", produces = MediaType.TEXT_PLAIN_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'ATENDENTE')")
    public ResponseEntity<String> gerarComprovante(@PathVariable Long id) {
        String comprovante = vendaService.gerarComprovante(id);
        return ResponseEntity.ok(comprovante);
    }

    // Listar todas as vendas
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ATENDENTE')")
    public ResponseEntity<List<Venda>> listarTodas() {
        return ResponseEntity.ok(vendaService.listarTodasVendas());
    }

    // Buscar venda por ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ATENDENTE')")
    public ResponseEntity<Venda> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(vendaService.buscarVendaPorId(id));
    }

    // RF17: Vendas por período
    @GetMapping("/periodo")
    @PreAuthorize("hasAnyRole('ADMIN', 'ATENDENTE')")
    public ResponseEntity<List<Venda>> listarPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        return ResponseEntity.ok(vendaService.listarVendasPorPeriodo(inicio, fim));
    }

    // RF18: Produtos mais vendidos
    @GetMapping("/mais-vendidos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Object[]>> listarProdutosMaisVendidos(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        return ResponseEntity.ok(vendaService.listarProdutosMaisVendidos(inicio, fim));
    }
}
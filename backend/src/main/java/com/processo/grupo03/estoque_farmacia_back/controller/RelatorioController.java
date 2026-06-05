package com.processo.grupo03.estoque_farmacia_back.controller;

import com.processo.grupo03.estoque_farmacia_back.model.Medicamento;
import com.processo.grupo03.estoque_farmacia_back.service.RelatorioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/relatorios")
@CrossOrigin(origins = "*")
public class RelatorioController {

    @Autowired
    private RelatorioService relatorioService;

    // RF17: Relatório mensal (só ADMIN)
    @GetMapping("/mensal")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> gerarRelatorioMensal(
            @RequestParam int mes,
            @RequestParam int ano) {
        String relatorio = relatorioService.gerarRelatorioMensal(mes, ano);
        return ResponseEntity.ok(relatorio);
    }

    // RF20: Itens em falta (só ADMIN)
    @GetMapping("/itens-em-falta")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Medicamento>> listarItensEmFalta() {
        return ResponseEntity.ok(relatorioService.listarItensEmFalta());
    }

    // RF21: Exportar CSV (só ADMIN)
    @GetMapping("/exportar-csv")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> exportarCSV(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        
        String csv = relatorioService.exportarRelatorioCSV(inicio, fim);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=relatorio_vendas.csv");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(csv);
    }
}
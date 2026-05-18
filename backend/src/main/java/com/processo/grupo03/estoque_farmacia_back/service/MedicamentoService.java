package com.processo.grupo03.estoque_farmacia_back.service;

import com.processo.grupo03.estoque_farmacia_back.dtos.MedicamentoRequestDTO;
import com.processo.grupo03.estoque_farmacia_back.enums.CategoriaMedicamento;
import com.processo.grupo03.estoque_farmacia_back.model.Lote;
import com.processo.grupo03.estoque_farmacia_back.model.Medicamento;
import com.processo.grupo03.estoque_farmacia_back.repository.LoteRepository;
import com.processo.grupo03.estoque_farmacia_back.repository.MedicamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MedicamentoService {
    
    @Autowired
    private MedicamentoRepository medicamentoRepository;
    
    @Autowired
    private LoteRepository loteRepository;
    
    @Transactional
    public Medicamento cadastrarMedicamento(MedicamentoRequestDTO dto) {
        if (dto.getDataValidade().isBefore(LocalDate.now())) {
            throw new RuntimeException("Data de validade não pode ser anterior à data atual");
        }
        
        Medicamento medicamento = new Medicamento();
        medicamento.setNome(dto.getNome());
        medicamento.setPrincipioAtivo(dto.getPrincipioAtivo());
        medicamento.setFabricante(dto.getFabricante());
        medicamento.setCategoria(dto.getCategoria());
        medicamento.setTipoControle(dto.getTipoControle());
        medicamento.setEstoqueMinimo(dto.getEstoqueMinimo());
        
        medicamento = medicamentoRepository.save(medicamento);
        
        Lote lote = new Lote();
        lote.setNumeroLote(dto.getNumeroLote());
        lote.setDataValidade(dto.getDataValidade());
        lote.setQuantidadeInicial(dto.getQuantidadeInicial());
        lote.setQuantidadeAtual(dto.getQuantidadeInicial());
        lote.setMedicamento(medicamento);
        
        loteRepository.save(lote);
        
        return medicamento;
    }
    
    public List<Medicamento> listarTodos() {
        return medicamentoRepository.findByAtivoTrue();
    }
    
    public Medicamento buscarPorId(Long id) {
        return medicamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicamento não encontrado"));
    }
    
    public List<Medicamento> buscarPorNome(String nome) {
        return medicamentoRepository.findByNomeContainingIgnoreCase(nome);
    }
    
    public List<Medicamento> buscarPorPrincipioAtivo(String principioAtivo) {
        return medicamentoRepository.findByPrincipioAtivoContainingIgnoreCase(principioAtivo);
    }
    
    // RF06, RF07: Listar medicamentos com estoque baixo
    public List<Medicamento> listarEstoqueBaixo() {
        return medicamentoRepository.findMedicamentosComEstoqueBaixo();
    }
    
    // RF06: Obter estoque total de um medicamento
    public Integer getEstoqueTotal(Long medicamentoId) {
        Medicamento medicamento = buscarPorId(medicamentoId);
        return medicamento.getEstoqueTotal();
    }
    
    // RF06, RF07: Verificar se estoque está baixo
    public boolean isEstoqueBaixo(Long medicamentoId) {
        Medicamento medicamento = buscarPorId(medicamentoId);
        return medicamento.isEstoqueBaixo();
    }
    
    // RF19: Filtrar por categoria
    public List<Medicamento> listarPorCategoria(CategoriaMedicamento categoria) {
        return medicamentoRepository.findByCategoria(categoria);
    }
    
    // RF08: Gerar lista de reposição automática (itens com estoque baixo)
    public Map<Medicamento, Integer> gerarListaReposicao() {
        List<Medicamento> medicamentosBaixos = listarEstoqueBaixo();
        
        Map<Medicamento, Integer> listaReposicao = new HashMap<>();
        
        for (Medicamento medicamento : medicamentosBaixos) {
            int quantidadeFaltando = medicamento.getEstoqueMinimo() - medicamento.getEstoqueTotal();
            if (quantidadeFaltando > 0) {
                listaReposicao.put(medicamento, quantidadeFaltando);
            }
        }
        
        return listaReposicao;
    }
}
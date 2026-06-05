package com.processo.grupo03.estoque_farmacia_back.service;

import com.processo.grupo03.estoque_farmacia_back.dtos.MedicamentoRequestDTO;
import com.processo.grupo03.estoque_farmacia_back.enums.CategoriaMedicamento;
import com.processo.grupo03.estoque_farmacia_back.exception.EntidadeNaoEncontradaException;
import com.processo.grupo03.estoque_farmacia_back.exception.RegraNegocioException;
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

@Service
public class MedicamentoService {

    @Autowired
    private MedicamentoRepository medicamentoRepository;

    @Autowired
    private LoteRepository loteRepository;

    @Transactional
    public Medicamento cadastrarMedicamento(MedicamentoRequestDTO dto) {
        if (dto.getDataValidade().isBefore(LocalDate.now())) {
            throw new RegraNegocioException("Data de validade não pode ser anterior à data atual", "DATA_VALIDADE_INVALIDA");
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
                .orElseThrow(() -> new EntidadeNaoEncontradaException("Medicamento não encontrado", "MEDICAMENTO_NAO_ENCONTRADO"));
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


    // Adicione estes métodos ao MedicamentoService existente

    // RF19: Listar por categoria
    public List<Medicamento> listarPorCategoria(String categoria) {
        CategoriaMedicamento cat;
        try {
            cat = CategoriaMedicamento.valueOf(categoria.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RegraNegocioException("Categoria inválida. Use ORIGINAL ou GENERICO", "CATEGORIA_INVALIDA");
        }
        return medicamentoRepository.findByCategoria(cat);
    }

    // Atualizar medicamento
    @Transactional
    public Medicamento atualizarMedicamento(Long id, MedicamentoRequestDTO dto) {
        Medicamento medicamento = buscarPorId(id);

        medicamento.setNome(dto.getNome());
        medicamento.setPrincipioAtivo(dto.getPrincipioAtivo());
        medicamento.setFabricante(dto.getFabricante());
        medicamento.setCategoria(dto.getCategoria());
        medicamento.setTipoControle(dto.getTipoControle());
        medicamento.setEstoqueMinimo(dto.getEstoqueMinimo());

        return medicamentoRepository.save(medicamento);
    }

    // Soft delete - desativar medicamento
    @Transactional
    public void desativarMedicamento(Long id) {
        Medicamento medicamento = buscarPorId(id);
        medicamento.setAtivo(false);
        medicamentoRepository.save(medicamento);
    }

    // Reativar medicamento
    @Transactional
    public void reativarMedicamento(Long id) {
        Medicamento medicamento = medicamentoRepository.findById(id)
                .orElseThrow(() -> new EntidadeNaoEncontradaException("Medicamento não encontrado", "MEDICAMENTO_NAO_ENCONTRADO"));
        medicamento.setAtivo(true);
        medicamentoRepository.save(medicamento);
    }
}
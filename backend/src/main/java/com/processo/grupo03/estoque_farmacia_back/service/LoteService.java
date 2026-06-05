package com.processo.grupo03.estoque_farmacia_back.service;

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
import java.util.List;

@Service
public class LoteService {

    @Autowired
    private LoteRepository loteRepository;

    @Autowired
    private MedicamentoRepository medicamentoRepository;

    // RF04: Verificar se lote está vencido
    public boolean isVencido(Lote lote) {
        return lote.isVencido();
    }

    // RF02, RF03: Adicionar estoque ao lote
    @Transactional
    public Lote adicionarEstoque(Long loteId, int quantidade) {
        if (quantidade <= 0) {
            throw new RegraNegocioException("Quantidade deve ser maior que zero", "QUANTIDADE_INVALIDA");
        }

        Lote lote = loteRepository.findById(loteId)
                .orElseThrow(() -> new EntidadeNaoEncontradaException("Lote não encontrado", "LOTE_NAO_ENCONTRADO"));

        if (lote.isVencido()) {
            throw new RegraNegocioException("Não é possível adicionar estoque a um lote vencido", "LOTE_VENCIDO");
        }

        int novaQuantidade = lote.getQuantidadeAtual() + quantidade;
        lote.setQuantidadeAtual(novaQuantidade);

        return loteRepository.save(lote);
    }

    // RF03, RF11: Remover estoque do lote (venda/consumo)
    @Transactional
    public Lote removerEstoque(Long loteId, int quantidade) {
        if (quantidade <= 0) {
            throw new RegraNegocioException("Quantidade deve ser maior que zero", "QUANTIDADE_INVALIDA");
        }

        Lote lote = loteRepository.findById(loteId)
                .orElseThrow(() -> new EntidadeNaoEncontradaException("Lote não encontrado", "LOTE_NAO_ENCONTRADO"));

        if (lote.isVencido()) {
            throw new RegraNegocioException("Não é possível vender um produto de lote vencido", "LOTE_VENCIDO");
        }

        if (lote.getQuantidadeAtual() < quantidade) {
            throw new RegraNegocioException("Estoque insuficiente no lote. Disponível: " + lote.getQuantidadeAtual(), "ESTOQUE_INSUFICIENTE");
        }

        int novaQuantidade = lote.getQuantidadeAtual() - quantidade;
        lote.setQuantidadeAtual(novaQuantidade);

        return loteRepository.save(lote);
    }

    // RF04: Listar lotes por medicamento
    public List<Lote> listarPorMedicamento(Long medicamentoId) {
        Medicamento medicamento = medicamentoRepository.findById(medicamentoId)
                .orElseThrow(() -> new EntidadeNaoEncontradaException("Medicamento não encontrado", "MEDICAMENTO_NAO_ENCONTRADO"));

        return loteRepository.findByMedicamentoId(medicamentoId);
    }

    // RF05: Listar lotes vencidos
    public List<Lote> listarVencidos() {
        return loteRepository.findLotesVencidosComEstoque(LocalDate.now());
    }

    // RF05: Listar lotes próximos do vencimento (em X dias)
    public List<Lote> listarProximosVencimento(int dias) {
        if (dias <= 0) {
            throw new RegraNegocioException("Número de dias deve ser maior que zero", "PARAMETRO_INVALIDO");
        }

        LocalDate hoje = LocalDate.now();
        LocalDate dataLimite = hoje.plusDays(dias);

        return loteRepository.findLotesProximosVencimento(hoje, dataLimite);
    }

    // Buscar lote por ID
    public Lote buscarPorId(Long id) {
        return loteRepository.findById(id)
                .orElseThrow(() -> new EntidadeNaoEncontradaException("Lote não encontrado", "LOTE_NAO_ENCONTRADO"));
    }

    // Listar todos os lotes
    public List<Lote> listarTodos() {
        return loteRepository.findAll();
    }

    // Buscar lote por número
    public Lote buscarLotePorNumero(String numeroLote) {
        return loteRepository.findByNumeroLote(numeroLote)
                .orElseThrow(() -> new EntidadeNaoEncontradaException("Lote não encontrado: " + numeroLote, "LOTE_NAO_ENCONTRADO"));
    }
}
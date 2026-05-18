package com.processo.grupo03.estoque_farmacia_back.service;

import com.processo.grupo03.estoque_farmacia_back.dtos.EntradaEstoqueDTO;
import com.processo.grupo03.estoque_farmacia_back.dtos.SaidaEstoqueDTO;
import com.processo.grupo03.estoque_farmacia_back.enums.TipoMovimentacao;
import com.processo.grupo03.estoque_farmacia_back.model.Lote;
import com.processo.grupo03.estoque_farmacia_back.model.MovimentacaoEstoque;
import com.processo.grupo03.estoque_farmacia_back.model.Usuario;
import com.processo.grupo03.estoque_farmacia_back.repository.LoteRepository;
import com.processo.grupo03.estoque_farmacia_back.repository.MovimentacaoEstoqueRepository;
import com.processo.grupo03.estoque_farmacia_back.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MovimentacaoEstoqueService {

    @Autowired
    private MovimentacaoEstoqueRepository movimentacaoRepository;

    @Autowired
    private LoteRepository loteRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private LoteService loteService;

    // Obter usuário logado atual
    private Usuario getUsuarioLogado() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String login = userDetails.getUsername();
        return usuarioRepository.findByLogin(login)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    // RF02: Registrar entrada manual de produtos
    @Transactional
    public MovimentacaoEstoque registrarEntrada(EntradaEstoqueDTO dto) {
        Usuario usuario = getUsuarioLogado();
        
        Lote lote = loteRepository.findById(dto.getLoteId())
                .orElseThrow(() -> new RuntimeException("Lote não encontrado"));

        // Adiciona estoque ao lote
        loteService.adicionarEstoque(lote.getId(), dto.getQuantidade());

        // Cria movimentação
        MovimentacaoEstoque movimentacao = new MovimentacaoEstoque();
        movimentacao.setUsuario(usuario);
        movimentacao.setLote(lote);
        movimentacao.setTipo(TipoMovimentacao.ENTRADA);
        movimentacao.setQuantidade(dto.getQuantidade());
        movimentacao.setDataHora(LocalDateTime.now());
        movimentacao.setObservacao(dto.getObservacao());

        return movimentacaoRepository.save(movimentacao);
    }

    // RF11: Registrar saída/venda
    @Transactional
    public MovimentacaoEstoque registrarSaida(SaidaEstoqueDTO dto) {
        Usuario usuario = getUsuarioLogado();
        
        Lote lote = loteRepository.findById(dto.getLoteId())
                .orElseThrow(() -> new RuntimeException("Lote não encontrado"));

        // Verifica se lote está vencido
        if (loteService.isVencido(lote)) {
            throw new RuntimeException("Não é possível vender produto de lote vencido");
        }

        // Remove estoque do lote
        loteService.removerEstoque(lote.getId(), dto.getQuantidade());

        // Cria movimentação
        MovimentacaoEstoque movimentacao = new MovimentacaoEstoque();
        movimentacao.setUsuario(usuario);
        movimentacao.setLote(lote);
        movimentacao.setTipo(TipoMovimentacao.SAIDA);
        movimentacao.setQuantidade(dto.getQuantidade());
        movimentacao.setDataHora(LocalDateTime.now());
        movimentacao.setObservacao(dto.getObservacao());
        movimentacao.setVendaId(dto.getVendaId());

        return movimentacaoRepository.save(movimentacao);
    }

    // RF10: Listar histórico de movimentações
    public List<MovimentacaoEstoque> listarHistorico(LocalDateTime inicio, LocalDateTime fim) {
        if (inicio != null && fim != null) {
            return movimentacaoRepository.findByDataHoraBetween(inicio, fim);
        }
        return movimentacaoRepository.findAll();
    }

    // Listar movimentações por tipo
    public List<MovimentacaoEstoque> listarPorTipo(TipoMovimentacao tipo) {
        return movimentacaoRepository.findByTipo(tipo);
    }

    // Listar movimentações por usuário
    public List<MovimentacaoEstoque> listarPorUsuario(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return movimentacaoRepository.findByUsuario(usuario);
    }


}
package com.processo.grupo03.estoque_farmacia_back.service;

import com.processo.grupo03.estoque_farmacia_back.dtos.*;
import com.processo.grupo03.estoque_farmacia_back.enums.TipoControle;
import com.processo.grupo03.estoque_farmacia_back.enums.TipoMovimentacao;
import com.processo.grupo03.estoque_farmacia_back.model.*;
import com.processo.grupo03.estoque_farmacia_back.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VendaService {

    @Autowired
    private VendaRepository vendaRepository;

    @Autowired
    private ItemVendaRepository itemVendaRepository;

    @Autowired
    private LoteRepository loteRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private MovimentacaoEstoqueRepository movimentacaoRepository;

    @Autowired
    private LoteService loteService;

    private Usuario getUsuarioLogado() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String login = userDetails.getUsername();
        return usuarioRepository.findByLogin(login)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    // RF23: Validar receita para medicamentos controlados
    private void validarReceitaControlada(Lote lote, String receitaRegistro) {
        if (lote.getMedicamento().getTipoControle() == TipoControle.CONTROLADO) {
            if (receitaRegistro == null || receitaRegistro.trim().isEmpty()) {
                throw new RuntimeException("Medicamento controlado exige registro da receita médica (RF23)");
            }
        }
    }

    // RF11, RF12, RF14, RF23: Registrar venda com baixa automática
    @Transactional
    public VendaResponseDTO registrarVenda(VendaRequestDTO request) {
        Usuario usuario = getUsuarioLogado();
        
        // RF12: Identificação do vendedor já está pelo usuário logado
        
        List<ItemVenda> itensVenda = new ArrayList<>();
        double valorTotal = 0.0;
        
        for (ItemVendaDTO itemDTO : request.getItens()) {
            Lote lote = loteRepository.findById(itemDTO.getLoteId())
                    .orElseThrow(() -> new RuntimeException("Lote não encontrado: " + itemDTO.getLoteId()));
            
            // RF23: Validar receita para controlados
            validarReceitaControlada(lote, request.getReceitaRegistro());
            
            // Verificar estoque
            if (lote.getQuantidadeAtual() < itemDTO.getQuantidade()) {
                throw new RuntimeException("Estoque insuficiente no lote " + lote.getNumeroLote() + 
                    ". Disponível: " + lote.getQuantidadeAtual());
            }
            
            // Verificar validade
            if (loteService.isVencido(lote)) {
                throw new RuntimeException("Produto do lote " + lote.getNumeroLote() + " está vencido");
            }
            
            double subtotal = itemDTO.getQuantidade() * itemDTO.getPrecoUnitario();
            valorTotal += subtotal;
            
            // Criar item (ainda sem venda)
            ItemVenda item = new ItemVenda();
            item.setLote(lote);
            item.setQuantidade(itemDTO.getQuantidade());
            item.setPrecoUnitario(itemDTO.getPrecoUnitario());
            item.setSubtotal(subtotal);
            itensVenda.add(item);
        }
        
       
        Venda venda = new Venda();
        venda.setUsuario(usuario);
        venda.setValorTotal(valorTotal);
        venda.setDataVenda(LocalDateTime.now());
        venda.setReceitaRegistro(request.getReceitaRegistro());
        venda.setEncomenda(request.getEncomenda() != null ? request.getEncomenda() : false);
        venda.setCancelada(false);
        
        venda = vendaRepository.save(venda);
        
       
        for (ItemVenda item : itensVenda) {
            item.setVenda(venda);
            itemVendaRepository.save(item);
            
        
            loteService.removerEstoque(item.getLote().getId(), item.getQuantidade());
            
         
            MovimentacaoEstoque movimentacao = new MovimentacaoEstoque();
            movimentacao.setUsuario(usuario);
            movimentacao.setLote(item.getLote());
            movimentacao.setTipo(TipoMovimentacao.SAIDA);
            movimentacao.setQuantidade(item.getQuantidade());
            movimentacao.setDataHora(LocalDateTime.now());
            movimentacao.setObservacao("Venda #" + venda.getId());
            movimentacao.setVendaId(venda.getId());
            movimentacao.setReceitaRegistro(request.getReceitaRegistro());
            movimentacaoRepository.save(movimentacao);
        }
        
        return converterParaResponseDTO(venda);
    }
    

    @Transactional
    public VendaResponseDTO cancelarVenda(Long vendaId) {
        Usuario usuario = getUsuarioLogado();
        
        Venda venda = vendaRepository.findById(vendaId)
                .orElseThrow(() -> new RuntimeException("Venda não encontrada"));
        
        if (venda.getCancelada()) {
            throw new RuntimeException("Venda já foi cancelada anteriormente");
        }
        

        List<ItemVenda> itens = itemVendaRepository.findByVendaId(vendaId);
        

        for (ItemVenda item : itens) {
            loteService.adicionarEstoque(item.getLote().getId(), item.getQuantidade());
            
    
            MovimentacaoEstoque movimentacao = new MovimentacaoEstoque();
            movimentacao.setUsuario(usuario);
            movimentacao.setLote(item.getLote());
            movimentacao.setTipo(TipoMovimentacao.ESTORNO);
            movimentacao.setQuantidade(item.getQuantidade());
            movimentacao.setDataHora(LocalDateTime.now());
            movimentacao.setObservacao("Cancelamento da venda #" + vendaId);
            movimentacao.setVendaId(vendaId);
            movimentacaoRepository.save(movimentacao);
        }
        

        venda.setCancelada(true);
        venda.setDataCancelamento(LocalDateTime.now());
        venda = vendaRepository.save(venda);
        
        return converterParaResponseDTO(venda);
    }
    

    @Transactional
    public Venda marcarComoEncomenda(Long vendaId) {
        Venda venda = vendaRepository.findById(vendaId)
                .orElseThrow(() -> new RuntimeException("Venda não encontrada"));
        
        venda.setEncomenda(true);
        return vendaRepository.save(venda);
    }
    
    // RF15: Gerar comprovante simplificado
    public String gerarComprovante(Long vendaId) {
        Venda venda = vendaRepository.findById(vendaId)
                .orElseThrow(() -> new RuntimeException("Venda não encontrada"));
        
        List<ItemVenda> itens = itemVendaRepository.findByVendaId(vendaId);
        
        StringBuilder comprovante = new StringBuilder();
        comprovante.append("        FARMÁCIA - COMPROVANTE        \n");
        comprovante.append("Venda #: ").append(venda.getId()).append("\n");
        comprovante.append("Data: ").append(venda.getDataVenda()).append("\n");
        comprovante.append("Vendedor: ").append(venda.getUsuario().getNome()).append("\n");
        comprovante.append("----------------------------------------\n");
        
        for (ItemVenda item : itens) {
            comprovante.append(item.getLote().getMedicamento().getNome())
                    .append(" x").append(item.getQuantidade())
                    .append(" - R$ ").append(String.format("%.2f", item.getSubtotal()))
                    .append("\n");
        }
        
        comprovante.append("----------------------------------------\n");
        comprovante.append("TOTAL: R$ ").append(String.format("%.2f", venda.getValorTotal())).append("\n");
        
        if (venda.getEncomenda()) {
            comprovante.append("*** ENCOMENDA ***\n");
        }
        
        if (venda.getReceitaRegistro() != null && !venda.getReceitaRegistro().isEmpty()) {
            comprovante.append("Receita: ").append(venda.getReceitaRegistro()).append("\n");
        }
        
        
        return comprovante.toString();
    }
    

public List<Venda> listarVendasPorPeriodo(LocalDateTime inicio, LocalDateTime fim) {
    if (inicio == null || fim == null) {
        throw new RuntimeException("Datas de início e fim são obrigatórias");
    }
    return vendaRepository.findVendasAtivasNoPeriodo(inicio, fim);
}
  
    public List<Object[]> listarProdutosMaisVendidos(LocalDateTime inicio, LocalDateTime fim) {
        return itemVendaRepository.findProdutosMaisVendidos(inicio, fim);
    }
    

    public List<Venda> listarTodasVendas() {
        return vendaRepository.findAll();
    }
    

    public Venda buscarVendaPorId(Long id) {
        return vendaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venda não encontrada"));
    }
    
   
    private VendaResponseDTO converterParaResponseDTO(Venda venda) {
        VendaResponseDTO response = new VendaResponseDTO();
        response.setId(venda.getId());
        response.setDataVenda(venda.getDataVenda());
        response.setVendedor(venda.getUsuario().getNome());
        response.setValorTotal(venda.getValorTotal());
        response.setEncomenda(venda.getEncomenda());
        response.setReceitaRegistro(venda.getReceitaRegistro());
        
        List<ItemVenda> itens = itemVendaRepository.findByVendaId(venda.getId());
        List<ItemVendaResponseDTO> itensResponse = itens.stream().map(item -> {
            ItemVendaResponseDTO itemDTO = new ItemVendaResponseDTO();
            itemDTO.setMedicamentoNome(item.getLote().getMedicamento().getNome());
            itemDTO.setNumeroLote(item.getLote().getNumeroLote());
            itemDTO.setQuantidade(item.getQuantidade());
            itemDTO.setPrecoUnitario(item.getPrecoUnitario());
            itemDTO.setSubtotal(item.getSubtotal());
            return itemDTO;
        }).collect(Collectors.toList());
        
        response.setItens(itensResponse);
        return response;
    }
}
package com.processo.grupo03.estoque_farmacia_back.dtos;

import java.time.LocalDateTime;
import java.util.List;

public class ErroResposta {
    private LocalDateTime timestamp;
    private int status;
    private String codigo;
    private String mensagem;
    private List<String> detalhes;

    public ErroResposta(LocalDateTime timestamp, int status, String codigo, String mensagem, List<String> detalhes) {
        this.timestamp = timestamp;
        this.status = status;
        this.codigo = codigo;
        this.mensagem = mensagem;
        this.detalhes = detalhes;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getMensagem() {
        return mensagem;
    }

    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }

    public List<String> getDetalhes() {
        return detalhes;
    }

    public void setDetalhes(List<String> detalhes) {
        this.detalhes = detalhes;
    }

}

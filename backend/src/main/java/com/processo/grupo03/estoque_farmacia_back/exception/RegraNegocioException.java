package com.processo.grupo03.estoque_farmacia_back.exception;

public class RegraNegocioException extends RuntimeException {
    private final String codigoErro;

    public RegraNegocioException(String mensagem, String codigoErro) {
        super(mensagem);
        this.codigoErro = codigoErro;
    }

    public String getCodigoErro() {
        return codigoErro;
    }
}

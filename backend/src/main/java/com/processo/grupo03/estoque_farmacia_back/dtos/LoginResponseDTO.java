package com.processo.grupo03.estoque_farmacia_back.dtos;

public class LoginResponseDTO {
    private String token;
    private String tipo = "Bearer";
    private String perfil;
    private String nome;
    private Long usuarioId;
    
    public LoginResponseDTO(String token, String perfil, String nome, Long usuarioId) {
        this.token = token;
        this.perfil = perfil;
        this.nome = nome;
        this.usuarioId = usuarioId;
    }
    
    
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    
    public String getPerfil() { return perfil; }
    public void setPerfil(String perfil) { this.perfil = perfil; }
    
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    
    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
}
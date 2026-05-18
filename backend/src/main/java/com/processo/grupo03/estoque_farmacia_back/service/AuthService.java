package com.processo.grupo03.estoque_farmacia_back.service;

import com.processo.grupo03.estoque_farmacia_back.dtos.LoginRequestDTO;
import com.processo.grupo03.estoque_farmacia_back.dtos.LoginResponseDTO;
import com.processo.grupo03.estoque_farmacia_back.model.Usuario;
import com.processo.grupo03.estoque_farmacia_back.repository.UsuarioRepository;
import com.processo.grupo03.estoque_farmacia_back.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class AuthService {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    public LoginResponseDTO realizarLogin(LoginRequestDTO loginRequest) {
        // Autentica o usuário
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getLogin(),
                loginRequest.getSenha()
            )
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        // Gera o token JWT
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtUtil.generateToken(userDetails);
        
        // Busca o usuário para informações adicionais
        Usuario usuario = usuarioRepository.findByLogin(loginRequest.getLogin())
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        // Atualiza último acesso
        usuario.setUltimoAcesso(LocalDateTime.now());
        usuarioRepository.save(usuario);
        
        return new LoginResponseDTO(
            token,
            usuario.getPerfil().name(),
            usuario.getNome(),
            usuario.getId()
        );
    }
}
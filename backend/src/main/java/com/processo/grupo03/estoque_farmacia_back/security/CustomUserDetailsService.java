package com.processo.grupo03.estoque_farmacia_back.security;

import com.processo.grupo03.estoque_farmacia_back.model.Usuario;
import com.processo.grupo03.estoque_farmacia_back.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Override
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByLogin(login)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + login));
        
        System.out.println("Carregando usuário: " + usuario.getLogin());
        System.out.println("Perfil do usuário: " + usuario.getPerfil().name());
        System.out.println("Role gerada: ROLE_" + usuario.getPerfil().name());
        
        return new User(
                usuario.getLogin(),
                usuario.getSenha(),
                usuario.getAtivo(),
                true,
                true,
                true,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + usuario.getPerfil().name()))
        );
    }
}
package com.processo.grupo03.estoque_farmacia_back.config;

import com.processo.grupo03.estoque_farmacia_back.enums.PerfilUsuario;
import com.processo.grupo03.estoque_farmacia_back.model.Usuario;
import com.processo.grupo03.estoque_farmacia_back.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // Criar usuário ADMIN padrão se não existir
        if (!usuarioRepository.existsByLogin("admin")) {
            Usuario admin = new Usuario();
            admin.setNome("Proprietária");
            admin.setLogin("admin");
            admin.setSenha(passwordEncoder.encode("admin123"));
            admin.setPerfil(PerfilUsuario.ADMIN);
            usuarioRepository.save(admin);
            System.out.println("Usuário ADMIN criado: login=admin / senha=admin123");
        }
        
        // Criar usuário ATENDENTE padrão se não existir
        if (!usuarioRepository.existsByLogin("atendente")) {
            Usuario atendente = new Usuario();
            atendente.setNome("Atendente");
            atendente.setLogin("atendente");
            atendente.setSenha(passwordEncoder.encode("atendente123"));
            atendente.setPerfil(PerfilUsuario.ATENDENTE);
            usuarioRepository.save(atendente);
            System.out.println("Usuário ATENDENTE criado: login=atendente / senha=atendente123");
        }
    }
}
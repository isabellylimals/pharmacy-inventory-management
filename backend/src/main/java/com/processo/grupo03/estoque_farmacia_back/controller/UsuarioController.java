package com.processo.grupo03.estoque_farmacia_back.controller;

import com.processo.grupo03.estoque_farmacia_back.enums.PerfilUsuario;
import com.processo.grupo03.estoque_farmacia_back.model.Usuario;
import com.processo.grupo03.estoque_farmacia_back.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<Usuario>> listarTodos() {
        List<Usuario> usuarios = usuarioRepository.findAll().stream().map(u -> {
            u.setSenha(""); // hide password
            return u;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(usuarios);
    }

    @PostMapping
    public ResponseEntity<?> cadastrar(@RequestBody Usuario usuario) {
        if (usuarioRepository.existsByLogin(usuario.getLogin())) {
            return ResponseEntity.badRequest().body("Login já existe");
        }
        
        Usuario novoUsuario = new Usuario();
        novoUsuario.setNome(usuario.getNome());
        novoUsuario.setLogin(usuario.getLogin());
        novoUsuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        novoUsuario.setPerfil(usuario.getPerfil() != null ? usuario.getPerfil() : PerfilUsuario.ATENDENTE);
        novoUsuario.setDataCadastro(LocalDateTime.now());
        novoUsuario.setAtivo(true);

        novoUsuario = usuarioRepository.save(novoUsuario);
        novoUsuario.setSenha(""); // hide password
        return ResponseEntity.status(HttpStatus.CREATED).body(novoUsuario);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (!usuarioRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        usuarioRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

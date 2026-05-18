package com.processo.grupo03.estoque_farmacia_back.repository;

import com.processo.grupo03.estoque_farmacia_back.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByLogin(String login);
    boolean existsByLogin(String login);
Optional<Usuario> findByLoginIgnoreCase(String login);
    
}
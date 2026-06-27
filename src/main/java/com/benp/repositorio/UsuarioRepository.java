package com.benp.repositorio;

import com.benp.modelo.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    Optional<Usuario> findByCorreo(String correo);

    boolean existsByCorreo(String correo);
    boolean existsByDni(String dni);
    boolean existsByNumero(String numero);
}

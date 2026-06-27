package com.benp.servicio;

import com.benp.excepcion.UsuarioDuplicadoException;
import com.benp.modelo.Usuario;
import com.benp.repositorio.UsuarioRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    // Equivalente a UsuarioDAO.registrarUsuario(...), validando duplicados igual
    // que antes se validaba el codigo de error 1062 de MySQL.
    public Usuario registrar(Usuario usuario) {
        if (usuarioRepository.existsByCorreo(usuario.getCorreo())) {
            throw new UsuarioDuplicadoException("El correo electronico ingresado ya esta registrado.");
        }
        if (usuarioRepository.existsByDni(usuario.getDni())) {
            throw new UsuarioDuplicadoException("El numero de DNI ingresado ya esta registrado.");
        }
        if (usuarioRepository.existsByNumero(usuario.getNumero())) {
            throw new UsuarioDuplicadoException("El numero de celular ingresado ya esta registrado.");
        }

        usuario.setId(null);
        usuario.setClave(BCrypt.hashpw(usuario.getClave(), BCrypt.gensalt()));
        return usuarioRepository.save(usuario);
    }

    // Equivalente a UsuarioDAO.autenticar(...)
    public Usuario autenticar(String correo, String claveIngresada) {
        return usuarioRepository.findByCorreo(correo)
                .filter(u -> BCrypt.checkpw(claveIngresada, u.getClave()))
                .orElse(null);
    }
}

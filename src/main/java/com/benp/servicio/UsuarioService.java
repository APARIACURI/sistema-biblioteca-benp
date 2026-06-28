package com.benp.servicio;

import com.benp.dto.UsuarioRegistroDTO;
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
    // Recibe un DTO (no la entidad Usuario) para que el cliente NO pueda mandar
    // "tipoUsuario":"admin" ni un "id" propio en el JSON (mass assignment).
    public Usuario registrar(UsuarioRegistroDTO datos) {
        if (usuarioRepository.existsByCorreo(datos.getCorreo())) {
            throw new UsuarioDuplicadoException("El correo electronico ingresado ya esta registrado.");
        }
        if (usuarioRepository.existsByDni(datos.getDni())) {
            throw new UsuarioDuplicadoException("El numero de DNI ingresado ya esta registrado.");
        }
        if (usuarioRepository.existsByNumero(datos.getNumero())) {
            throw new UsuarioDuplicadoException("El numero de celular ingresado ya esta registrado.");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(datos.getNombre());
        usuario.setApellido(datos.getApellido());
        usuario.setCorreo(datos.getCorreo());
        usuario.setNumero(datos.getNumero());
        usuario.setDni(datos.getDni());
        usuario.setApodo(datos.getApodo());
        usuario.setClave(BCrypt.hashpw(datos.getClave(), BCrypt.gensalt()));
        // El tipo de usuario SIEMPRE se fija en el backend, nunca lo decide el cliente.
        usuario.setTipoUsuario("estudiante");

        return usuarioRepository.save(usuario);
    }

    // Equivalente a UsuarioDAO.autenticar(...)
    public Usuario autenticar(String correo, String claveIngresada) {
        return usuarioRepository.findByCorreo(correo)
                .filter(u -> BCrypt.checkpw(claveIngresada, u.getClave()))
                .orElse(null);
    }
}

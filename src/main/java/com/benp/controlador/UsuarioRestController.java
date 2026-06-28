package com.benp.controlador;

import com.benp.dto.UsuarioRegistroDTO;
import com.benp.dto.UsuarioResponseDTO;
import com.benp.excepcion.UsuarioDuplicadoException;
import com.benp.modelo.Usuario;
import com.benp.servicio.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

// Reemplaza a UsuarioServlet (urlPatterns = "/api/usuarios")
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioRestController {

    private final UsuarioService usuarioService;

    public UsuarioRestController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> registrar(@RequestBody UsuarioRegistroDTO datos) {
        try {
            Usuario creado = usuarioService.registrar(datos);
            return ResponseEntity.ok(Map.of(
                    "mensaje", "Usuario registrado correctamente",
                    "status", "success",
                    "usuario", UsuarioResponseDTO.desde(creado)));
        } catch (UsuarioDuplicadoException e) {
            // Equivalente al HTTP 409 Conflict que devolvia el servlet original
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("mensaje", e.getMessage(), "status", "error"));
        }
    }
}

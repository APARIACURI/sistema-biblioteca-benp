package com.benp.controlador;

import com.benp.dto.CredencialesDTO;
import com.benp.dto.UsuarioResponseDTO;
import com.benp.modelo.Usuario;
import com.benp.servicio.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

// Reemplaza a LoginServlet (urlPatterns = "/api/login")
@RestController
@RequestMapping("/api/login")
public class LoginRestController {

    private final UsuarioService usuarioService;

    public LoginRestController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ResponseEntity<?> login(@RequestBody CredencialesDTO creds) {
        Usuario usuarioAutenticado = usuarioService.autenticar(creds.getCorreo(), creds.getClave());

        if (usuarioAutenticado != null) {
            // Nunca se devuelve el hash de la clave al cliente
            return ResponseEntity.ok(UsuarioResponseDTO.desde(usuarioAutenticado));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("mensaje", "Credenciales incorrectas"));
    }
}

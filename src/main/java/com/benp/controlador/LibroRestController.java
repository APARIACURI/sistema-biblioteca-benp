package com.benp.controlador;

import com.benp.dto.LibroRequestDTO;
import com.benp.modelo.Libro;
import com.benp.servicio.LibroService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// Reemplaza a LibroServlet (urlPatterns = "/api/libros")
@RestController
@RequestMapping("/api/libros")
public class LibroRestController {

    private final LibroService libroService;

    public LibroRestController(LibroService libroService) {
        this.libroService = libroService;
    }

    // GET /api/libros -> Catalogo de libros (igual que doGet)
    @GetMapping
    public List<Libro> listar() {
        return libroService.listarTodos();
    }

    // POST /api/libros -> Registrar libro nuevo (igual que doPost)
    @PostMapping
    public ResponseEntity<Map<String, String>> registrar(@RequestBody LibroRequestDTO data) {
        libroService.registrar(data);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    // PUT /api/libros -> Actualizar libro existente (igual que doPut)
    @PutMapping
    public ResponseEntity<Map<String, String>> actualizar(@RequestBody LibroRequestDTO data) {
        boolean exito = libroService.actualizarCompleto(data);
        if (exito) {
            return ResponseEntity.ok(Map.of("status", "ok", "mensaje", "Libro actualizado correctamente"));
        }
        return ResponseEntity.badRequest()
                .body(Map.of("status", "error", "mensaje", "No se pudo actualizar el libro en la base de datos"));
    }
}

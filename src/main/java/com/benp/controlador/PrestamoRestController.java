package com.benp.controlador;

import com.benp.dto.EstadoPrestamoRequestDTO;
import com.benp.dto.PrestamoRequestDTO;
import com.benp.modelo.Prestamo;
import com.benp.servicio.PrestamoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// Reemplaza a PrestamoServlet (urlPatterns = "/api/prestamos", "/api/prestamos/listar", "/api/prestamos/estado")
@RestController
@RequestMapping("/api/prestamos")
public class PrestamoRestController {

    private final PrestamoService prestamoService;

    public PrestamoRestController(PrestamoService prestamoService) {
        this.prestamoService = prestamoService;
    }

    // GET /api/prestamos/listar (y tambien /api/prestamos, por compatibilidad con el servlet original)
    @GetMapping({"", "/listar"})
    public List<Prestamo> listar() {
        return prestamoService.listarTodos();
    }

    // POST /api/prestamos -> El alumno reserva (resta stock)
    @PostMapping
    public ResponseEntity<Map<String, String>> reservar(@RequestBody PrestamoRequestDTO data) {
        boolean guardado = prestamoService.registrarPrestamo(data.getLibroId(), data.getTitulo(), data.getUsuario());
        if (guardado) {
            return ResponseEntity.ok(Map.of("status", "ok"));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Sin stock"));
    }

    // POST /api/prestamos/estado -> El Admin entrega o recibe el libro
    @PostMapping("/estado")
    public ResponseEntity<Map<String, String>> actualizarEstado(@RequestBody EstadoPrestamoRequestDTO data) {
        prestamoService.actualizarEstadoPrestamo(data.getPrestamoId(), data.getNuevoEstado());
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}

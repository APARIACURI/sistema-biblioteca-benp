package com.benp.controlador;

import com.benp.dto.MultaDTO;
import com.benp.dto.MultaPagoRequestDTO;
import com.benp.servicio.MultaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

// Reemplaza a MultaServlet (urlPatterns = "/api/multas")
@RestController
@RequestMapping("/api/multas")
public class MultaRestController {

    private final MultaService multaService;

    public MultaRestController(MultaService multaService) {
        this.multaService = multaService;
    }

    // GET /api/multas -> Lista de multas (mismo formato {id,user,book,reason,amount,date,status})
    @GetMapping
    public List<MultaDTO> listar() {
        return multaService.listarTodos();
    }

    // POST /api/multas -> Pagar una multa ({ multaId })
    @PostMapping
    public Map<String, String> pagar(@RequestBody MultaPagoRequestDTO data) {
        multaService.marcarComoPagada(data.getMultaId());
        return Map.of("status", "ok");
    }
}

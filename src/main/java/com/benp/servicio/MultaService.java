package com.benp.servicio;

import com.benp.dto.MultaDTO;
import com.benp.repositorio.MultaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MultaService {

    private final MultaRepository multaRepository;

    public MultaService(MultaRepository multaRepository) {
        this.multaRepository = multaRepository;
    }

    public List<MultaDTO> listarTodos() {
        return multaRepository.findAllByOrderByIdDesc()
                .stream()
                .map(MultaDTO::desde)
                .toList();
    }

    // Equivalente al doPost (pagar multa) de MultaServlet
    public void marcarComoPagada(Integer multaId) {
        multaRepository.findById(multaId).ifPresent(multa -> {
            multa.setEstado("Pagado");
            multaRepository.save(multa);
        });
    }
}

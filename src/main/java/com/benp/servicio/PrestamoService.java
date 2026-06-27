package com.benp.servicio;

import com.benp.modelo.Libro;
import com.benp.modelo.Prestamo;
import com.benp.repositorio.LibroRepository;
import com.benp.repositorio.PrestamoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class PrestamoService {

    private final PrestamoRepository prestamoRepository;
    private final LibroRepository libroRepository;

    public PrestamoService(PrestamoRepository prestamoRepository, LibroRepository libroRepository) {
        this.prestamoRepository = prestamoRepository;
        this.libroRepository = libroRepository;
    }

    public List<Prestamo> listarTodos() {
        return prestamoRepository.findAllByOrderByIdDesc();
    }

    // Equivalente a PrestamoDAO.registrarPrestamo(...): resta stock y guarda la reserva
    // de forma atomica (si no hay stock, no se guarda nada).
    @Transactional
    public boolean registrarPrestamo(Integer libroId, String titulo, String usuario) {
        Optional<Libro> libroOpt = libroRepository.findById(libroId);
        if (libroOpt.isEmpty()) {
            return false;
        }
        Libro libro = libroOpt.get();
        if (libro.getStock() <= 0) {
            return false; // Sin stock disponible
        }

        libro.setStock(libro.getStock() - 1);
        libroRepository.save(libro);

        Prestamo prestamo = new Prestamo();
        prestamo.setLibroId(libroId);
        prestamo.setTituloLibro(titulo);
        prestamo.setNombreUsuario(usuario);
        prestamo.setFechaPrestamo(LocalDate.now());
        prestamo.setEstado("Pendiente");
        prestamoRepository.save(prestamo);

        return true;
    }

    // Equivalente a PrestamoDAO.actualizarEstadoPrestamo(...)
    @Transactional
    public void actualizarEstadoPrestamo(Integer prestamoId, String nuevoEstado) {
        prestamoRepository.findById(prestamoId).ifPresent(prestamo -> {
            prestamo.setEstado(nuevoEstado);

            if ("Activo".equals(nuevoEstado)) {
                // El Admin hizo clic en "ENTREGAR" (el stock ya se resto al reservar)
                prestamo.setFechaEntrega(LocalDate.now());
                prestamo.setFechaVencimiento(LocalDate.now().plusDays(7));
            } else if ("Devuelto".equals(nuevoEstado)) {
                // El Admin hizo clic en "RECIBIR": el libro vuelve, se suma 1 al stock
                prestamo.setFechaDevolucionReal(LocalDate.now());
                libroRepository.findById(prestamo.getLibroId()).ifPresent(libro -> {
                    libro.setStock(libro.getStock() + 1);
                    libroRepository.save(libro);
                });
            }

            prestamoRepository.save(prestamo);
        });
    }
}

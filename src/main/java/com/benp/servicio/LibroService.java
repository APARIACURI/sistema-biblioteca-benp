package com.benp.servicio;

import com.benp.dto.LibroRequestDTO;
import com.benp.modelo.Libro;
import com.benp.repositorio.LibroRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LibroService {

    private final LibroRepository libroRepository;

    public LibroService(LibroRepository libroRepository) {
        this.libroRepository = libroRepository;
    }

    public List<Libro> listarTodos() {
        return libroRepository.findAllByOrderByIdDesc();
    }

    public void actualizarEstadoLibro(Integer id, String nuevoEstado) {
        libroRepository.findById(id).ifPresent(libro -> {
            libro.setEstado(nuevoEstado);
            libroRepository.save(libro);
        });
    }

    // Equivalente a LibroDAO.registrarLibro(...)
    public void registrar(LibroRequestDTO data) {
        // Seguridad: si llega sin cantidad, se pone 5 por defecto (igual que el servlet original)
        int stockFinal = data.getStock() > 0 ? data.getStock() : 5;

        Libro libro = new Libro();
        libro.setTitulo(data.getTitulo());
        libro.setAutor(data.getAutor());
        libro.setCategoria(data.getCategoria());
        libro.setEditorial(data.getEditorial());
        libro.setAnio(data.getAnio());
        libro.setIsbn(data.getIsbn());
        libro.setImagenUrl(data.getImagenUrl());
        libro.setStock(stockFinal);
        libro.setEstado("Disponible");

        libroRepository.save(libro);
    }

    // Equivalente a LibroDAO.actualizarLibroCompleto(...)
    public boolean actualizarCompleto(LibroRequestDTO data) {
        return libroRepository.findById(data.getId()).map(libro -> {
            libro.setTitulo(data.getTitulo());
            libro.setAutor(data.getAutor());
            libro.setCategoria(data.getCategoria());
            libro.setEditorial(data.getEditorial());
            libro.setAnio(data.getAnio());
            libro.setIsbn(data.getIsbn());
            libro.setImagenUrl(data.getImagenUrl());
            libro.setStock(data.getStock());
            libro.setEstado(data.getEstado());
            libroRepository.save(libro);
            return true;
        }).orElse(false);
    }
}

package com.benp.repositorio;

import com.benp.modelo.Libro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LibroRepository extends JpaRepository<Libro, Integer> {
    List<Libro> findAllByOrderByIdDesc();
}

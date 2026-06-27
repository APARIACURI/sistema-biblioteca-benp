package com.benp.repositorio;

import com.benp.modelo.Prestamo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrestamoRepository extends JpaRepository<Prestamo, Integer> {
    List<Prestamo> findAllByOrderByIdDesc();
}

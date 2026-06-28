package com.benp.repositorio;


import com.benp.modelo.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {

    // Buscar por estado (Activo / Inactivo)
    List<Categoria> findByEstado(String estado);

    // Buscar por nombre (contiene texto)
    List<Categoria> findByNombreContainingIgnoreCase(String nombre);
}


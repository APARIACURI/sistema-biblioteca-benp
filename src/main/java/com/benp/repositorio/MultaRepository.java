package com.benp.repositorio;

import com.benp.modelo.Multa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MultaRepository extends JpaRepository<Multa, Integer> {
    List<Multa> findAllByOrderByIdDesc();
}

package com.benp.servicio;

import com.benp.modelo.Categoria;
import com.benp.repositorio.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;

    public List<Categoria> listar() {
        return categoriaRepository.findAll();
    }

    public Categoria buscarPorId(Integer id) {
        return categoriaRepository.findById(id).orElse(null);
    }

    // Busqueda por nombre (para el cuadro de busqueda del panel admin).
    // Si no envian texto, se devuelve el listado completo.
    public List<Categoria> buscar(String nombre) {
        if (nombre == null || nombre.isBlank()) {
            return listar();
        }
        return categoriaRepository.findByNombreContainingIgnoreCase(nombre.trim());
    }

    public Categoria guardar(Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    public void eliminar(Integer id) {
        categoriaRepository.deleteById(id);
    }
}

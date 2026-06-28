package com.benp.controlador;

import com.benp.modelo.Categoria;
import com.benp.servicio.CategoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaRestController {

    @Autowired
    private CategoriaService categoriaService;

    // Listar todas las categorías
    @GetMapping
    public ResponseEntity<List<Categoria>> listar() {
        List<Categoria> lista = categoriaService.listar();
        return new ResponseEntity<>(lista, HttpStatus.OK);
    }

    // Buscar por nombre (lo usa el cuadro de busqueda del panel admin)
    // GET /api/categorias/buscar?nombre=texto
    @GetMapping("/buscar")
    public ResponseEntity<List<Categoria>> buscar(@RequestParam(required = false) String nombre) {
        return new ResponseEntity<>(categoriaService.buscar(nombre), HttpStatus.OK);
    }

    // Buscar por ID
    @GetMapping("/{id}")
    public ResponseEntity<Categoria> buscarPorId(@PathVariable Integer id) {
        Categoria categoria = categoriaService.buscarPorId(id);

        if (categoria == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(categoria, HttpStatus.OK);
    }

    // Crear nueva categoría
    @PostMapping
    public ResponseEntity<Categoria> guardar(@RequestBody Categoria categoria) {
        Categoria nueva = categoriaService.guardar(categoria);
        return new ResponseEntity<>(nueva, HttpStatus.CREATED);
    }

    //  Actualizar categoría
    @PutMapping("/{id}")
    public ResponseEntity<Categoria> actualizar(@PathVariable Integer id,
                                                @RequestBody Categoria categoria) {

        Categoria existente = categoriaService.buscarPorId(id);

        if (existente == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        existente.setNombre(categoria.getNombre());
        existente.setDescripcion(categoria.getDescripcion());
        existente.setEstado(categoria.getEstado());

        Categoria actualizado = categoriaService.guardar(existente);
        return new ResponseEntity<>(actualizado, HttpStatus.OK);
    }

    //  Eliminar categoría
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        Categoria categoria = categoriaService.buscarPorId(id);

        if (categoria == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        categoriaService.eliminar(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}

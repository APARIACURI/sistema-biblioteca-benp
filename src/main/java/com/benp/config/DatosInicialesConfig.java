package com.benp.config;

import com.benp.modelo.Categoria;
import com.benp.repositorio.CategoriaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Antes las categorias estaban "hardcodeadas" en App.jsx (Historias, Novelas, etc.)
 * y no existian en la base de datos. Ahora la tabla "categorias" es la fuente real
 * de datos (CRUD vía /api/categorias). Esto siembra esas mismas 8 categorias UNA
 * SOLA VEZ si la tabla esta vacia, para no romper los libros que ya tenian asignada
 * una de esas categorias como texto plano en libros.categoria.
 */
@Configuration
public class DatosInicialesConfig {

    @Bean
    public CommandLineRunner sembrarCategorias(CategoriaRepository categoriaRepository) {
        return args -> {
            if (categoriaRepository.count() == 0) {
                categoriaRepository.save(new Categoria(null, "Historias", "Libros de historia", "Activo"));
                categoriaRepository.save(new Categoria(null, "Novelas", "Novelas y ficcion", "Activo"));
                categoriaRepository.save(new Categoria(null, "Revistas", "Revistas y publicaciones periodicas", "Activo"));
                categoriaRepository.save(new Categoria(null, "Educativos", "Material educativo", "Activo"));
                categoriaRepository.save(new Categoria(null, "Poesía", "Poesia", "Activo"));
                categoriaRepository.save(new Categoria(null, "Cuentos", "Cuentos cortos", "Activo"));
                categoriaRepository.save(new Categoria(null, "Teatro", "Obras de teatro", "Activo"));
                categoriaRepository.save(new Categoria(null, "Religiosos", "Libros religiosos", "Activo"));
            }
        };
    }
}

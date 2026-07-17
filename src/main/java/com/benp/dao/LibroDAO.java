/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.benp.dao;

import com.benp.modelo.Libro;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class LibroDAO {

    // Método para obtener todos los libros y enviarlos al frontend
    public List<Libro> listarTodos() {
        List<Libro> lista = new ArrayList<>();
        // Unimos las tablas mediante la Llave Foránea para traer el nombre plano de la categoría de forma transparente
        String sql = "SELECT l.*, c.name AS categoria_nombre FROM libros l " +
                     "INNER JOIN categorias c ON l.categoria_id = c.id ORDER BY l.id DESC";
        
        try (Connection con = ConexionDB.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
             
            while (rs.next()) {
                Libro libro = new Libro();
                libro.setId(rs.getInt("id"));
                libro.setTitulo(rs.getString("titulo"));
                libro.setAutor(rs.getString("autor"));
                
                // 🚀 CLAVE RELACIONAL: Mapeamos el string del nombre devuelto dinámicamente por el JOIN
                libro.setCategoria(rs.getString("categoria_nombre")); 
                
                libro.setEstado(rs.getString("estado"));
                libro.setImagenUrl(rs.getString("imagen_url"));
                libro.setIsbn(rs.getString("isbn"));
                libro.setEditorial(rs.getString("editorial"));
                libro.setAnio(rs.getString("anio"));
                libro.setStock(rs.getInt("stock"));
                lista.add(libro);
            }
        } catch (SQLException e) {
            System.err.println("Error crítico en LibroDAO relacional: " + e.getMessage());
        }
        return lista;
    }

    public void actualizarEstadoLibro(int id, String nuevoEstado) {
        String sql = "UPDATE libros SET estado = ? WHERE id = ?";
        try (Connection con = ConexionDB.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, nuevoEstado);
            ps.setInt(2, id);
            ps.executeUpdate();
        } catch (SQLException e) {
            System.err.println("Error al actualizar estado: " + e.getMessage());
        }
    }
    
    // ---   recibe y guarda el STOCK ---
    public boolean registrarLibro(Libro libro) {
        // 1. Buscamos primero el ID correspondiente al texto de la categoría enviado por React
        int idCategoriaEncontrado = 1; // Por defecto Historias si falla
        String sqlBuscarCat = "SELECT id FROM categorias WHERE name = ? LIMIT 1";
        
        try (Connection con = ConexionDB.getConnection()) {
            try (PreparedStatement psC = con.prepareStatement(sqlBuscarCat)) {
                psC.setString(1, libro.getCategoria()); // Recibe el texto "Novelas", "Historias", etc.
                try (ResultSet rsC = psC.executeQuery()) {
                    if (rsC.next()) {
                        idCategoriaEncontrado = rsC.getInt("id");
                    }
                }
            }

            // 2. Insertamos físicamente en MySQL usando la columna relacional 'categoria_id'
            String sqlInsertar = "INSERT INTO libros (titulo, autor, categoria_id, estado, imagen_url, isbn, editorial, anio, stock) " +
                                 "VALUES (?, ?, ?, 'Activo', ?, ?, ?, ?, ?)";
            
            try (PreparedStatement ps = con.prepareStatement(sqlInsertar)) {
                ps.setString(1, libro.getTitulo());
                ps.setString(2, libro.getAutor());
                ps.setInt(3, idCategoriaEncontrado); // 🚀 Inyectamos la Llave Foránea numérica
                ps.setString(4, libro.getImagenUrl());
                ps.setString(5, libro.getIsbn());
                ps.setString(6, libro.getEditorial());
                ps.setString(7, libro.getAnio());
                ps.setInt(8, libro.getStock());
                
                return ps.executeUpdate() > 0;
            }
        } catch (SQLException e) {
            System.err.println("Error crítico al registrar nuevo libro relacional: " + e.getMessage());
            return false;
        }
    }

    //  MÉTODO AGREGADO: Realiza el UPDATE de todos los atributos modificados en React
    public boolean actualizarLibroCompleto(Libro libro) {
        String sql = "UPDATE libros SET titulo = ?, autor = ?, categoria = ?, editorial = ?, anio = ?, isbn = ?, imagen_url = ?, stock = ?, estado = ? WHERE id = ?";
        try (Connection con = ConexionDB.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            
            ps.setString(1, libro.getTitulo());
            ps.setString(2, libro.getAutor());
            ps.setString(3, libro.getCategoria());
            ps.setString(4, libro.getEditorial());
            ps.setString(5, libro.getAnio());
            ps.setString(6, libro.getIsbn());
            ps.setString(7, libro.getImagenUrl());
            ps.setInt(8, libro.getStock());
            ps.setString(9, libro.getEstado());
            ps.setInt(10, libro.getId()); // Llave primaria para el filtro WHERE
            
            return ps.executeUpdate() > 0; // Retorna verdadero si logró modificar la fila
        } catch (SQLException e) {
            System.err.println("Error al modificar libro en MySQL: " + e.getMessage());
            return false;
        }
    }
}

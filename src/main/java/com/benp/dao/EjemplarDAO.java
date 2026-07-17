/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.benp.dao;

import com.benp.modelo.Ejemplar;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class EjemplarDAO {

    // Lista solo las copias que pertenecen a un libro específico (WHERE libro_id = ?)
    public List<Ejemplar> listarPorLibro(int libroId) {
        List<Ejemplar> lista = new ArrayList<>();
        String sql = "SELECT * FROM ejemplares WHERE libro_id = ?";
        try (Connection con = ConexionDB.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, libroId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Ejemplar e = new Ejemplar();
                    e.setId(rs.getInt("id"));
                    e.setLibroId(rs.getInt("libro_id"));
                    e.setCodigoEjemplar(rs.getString("codigo_ejemplar"));
                    e.setUbicacion(rs.getString("ubicacion"));
                    e.setEstado(rs.getString("estado"));
                    e.setAnioImpresion(rs.getString("anio_impresion"));
                    lista.add(e);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error al listar ejemplares: " + e.getMessage());
        }
        return lista;
    }

    // 🟢 NUEVO MÉTODO POST: Registra un nuevo ejemplar físico en MySQL
        // 🟢 CORREGIDO: Alineación exacta sin tilde según el reporte de tu log
    public boolean insertarEjemplar(Ejemplar e) {
        String sql = "INSERT INTO ejemplares (libro_id, codigo_ejemplar, ubicacion, estado, anio_impresion) VALUES (?, ?, ?, ?, ?)";
        try (Connection con = ConexionDB.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            
            ps.setInt(1, e.getLibroId());
            ps.setString(2, e.getCodigoEjemplar());
            ps.setString(3, e.getUbicacion()); // Asegura que e.getUbicacion() no devuelva null
            ps.setString(4, e.getEstado());
            ps.setString(5, e.getAnioImpresion());
            
            return ps.executeUpdate() > 0;
        } catch (SQLException ex) {
            System.err.println("Error al insertar ejemplar: " + ex.getMessage());
            return false;
        }
    }



    // 🟢 RECONSTRUIDO: Modifica las propiedades individuales de un ejemplar físico (Punto 2)
    public boolean actualizarEjemplar(int id, String ubicacion, String estado, String anioImpresion) {
        String sql = "UPDATE ejemplares SET ubicacion = ?, estado = ?, anio_impresion = ? WHERE id = ?";
        try (Connection con = ConexionDB.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, ubicacion);
            ps.setString(2, estado);
            ps.setString(3, anioImpresion);
            ps.setInt(4, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error al actualizar ejemplar en MySQL: " + e.getMessage());
            return false;
        }
    }
}

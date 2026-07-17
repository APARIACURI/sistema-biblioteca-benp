/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.benp.dao;

import com.benp.modelo.Categoria;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author elias
 */
public class CategoriaDAO {

    public List<Categoria> listarTodas() {
        List<Categoria> lista = new ArrayList<>();
        String sql = "SELECT id, name, descripcion, estado FROM categorias ORDER BY id DESC";
        try (Connection con = ConexionDB.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                lista.add(new Categoria(
                    rs.getInt("id"),
                    rs.getString("name"),
                    rs.getString("descripcion"),
                    rs.getString("estado")
                ));
            }
        } catch (SQLException e) {
            System.err.println("Error en CategoriaDAO.listarTodas: " + e.getMessage());
        }
        return lista;
    }

    public boolean registrarCategoria(String nombre, String descripcion, String estado) {
        String sql = "INSERT INTO categorias (name, descripcion, estado) VALUES (?, ?, ?)";
        try (Connection con = ConexionDB.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, nombre);
            ps.setString(2, descripcion);
            ps.setString(3, estado);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error en CategoriaDAO.registrarCategoria: " + e.getMessage());
            return false;
        }
    }

    public boolean conmutarEstado(int id, String nuevoEstado) {
        String sql = "UPDATE categorias SET estado = ? WHERE id = ?";
        try (Connection con = ConexionDB.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, nuevoEstado);
            ps.setInt(2, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error en CategoriaDAO.conmutarEstado: " + e.getMessage());
            return false;
        }
    }
}
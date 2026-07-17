/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.benp.dao;

import com.benp.modelo.Usuario;
import java.sql.*;
import org.mindrot.jbcrypt.BCrypt; 

public class UsuarioDAO {

    // CORREGIDO: Ahora propaga la excepción SQLException hacia el Servlet para leer el tipo de duplicado
    public boolean registrarUsuario(Usuario usuario) throws SQLException {
        String sql = "INSERT INTO usuarios (nombre, apellido, correo, numero, dni, clave, apodo, tipo_usuario) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection con = ConexionDB.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
             
            ps.setString(1, usuario.getNombre());
            ps.setString(2, usuario.getApellido());
            ps.setString(3, usuario.getCorreo());
            ps.setString(4, usuario.getNumero());
            ps.setString(5, usuario.getDni());
            
            String claveEncriptada = BCrypt.hashpw(usuario.getclave(), BCrypt.gensalt());
            ps.setString(6, claveEncriptada);
            
            ps.setString(7, usuario.getApodo());
            ps.setString(8, usuario.getTipoUsuario());
            
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            // 🛑 VALIDACIÓN: Código de error 1062 en MySQL significa dato duplicado (UNIQUE KEY)
            if (e.getErrorCode() == 1062) {
                String errorMensaje = e.getMessage().toLowerCase();
                
                if (errorMensaje.contains("correo")) {
                    throw new SQLException("El correo electrónico ingresado ya está registrado.");
                } else if (errorMensaje.contains("dni")) {
                    throw new SQLException("El número de DNI ingresado ya está registrado.");
                } else if (errorMensaje.contains("numero")) { // 🛑 AGREGADO: Filtro para el Celular
                    throw new SQLException("El número de celular ingresado ya está registrado.");
                } else {
                    throw new SQLException("Este registro ya se encuentra en el sistema.");
                }
            }
            System.err.println("Error al registrar usuario: " + e.getMessage());
            throw e;
        }
    }

    public Usuario autenticar(String correo, String claveIngresada) {
        String sql = "SELECT * FROM usuarios WHERE correo = ?";
        Usuario usu = null;
        
        try (Connection con = ConexionDB.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
             
            ps.setString(1, correo);
            
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    String hashBaseDatos = rs.getString("clave");
                    
                    if (BCrypt.checkpw(claveIngresada, hashBaseDatos)) {
                        usu = new Usuario();
                        usu.setId(rs.getInt("id"));
                        usu.setNombre(rs.getString("nombre"));
                        usu.setApellido(rs.getString("apellido"));
                        usu.setCorreo(rs.getString("correo"));
                        usu.setNumero(rs.getString("numero"));
                        usu.setDni(rs.getString("dni"));
                        usu.setclave(hashBaseDatos); 
                        usu.setApodo(rs.getString("apodo"));
                        usu.setTipoUsuario(rs.getString("tipo_usuario"));
                    }
                }
            }
        } catch (SQLException e) {
            System.err.println("Error en login: " + e.getMessage());
        }
        return usu;
    }
}


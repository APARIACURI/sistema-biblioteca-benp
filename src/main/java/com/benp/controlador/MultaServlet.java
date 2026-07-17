
/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */

package com.benp.controlador;

import com.benp.dao.ConexionDB;
import com.google.gson.Gson;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.BufferedReader;

@WebServlet(name = "MultaServlet", urlPatterns = {"/api/multas"})
public class MultaServlet extends HttpServlet {

    // 🟢 TRAER LAS MULTAS (GET) - CORREGIDO CON COLUMNAS REALES DE MYSQL
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        List<Map<String, Object>> multas = new ArrayList<>();

        // Leemos estrictamente las columnas reales de tu tabla física
        try (Connection con = ConexionDB.getConnection();
             PreparedStatement ps = con.prepareStatement("SELECT * FROM multas ORDER BY id DESC");
             ResultSet rs = ps.executeQuery()) {
            
            while (rs.next()) {
                Map<String, Object> multa = new HashMap<>();
                multa.put("id", rs.getInt("id"));
                
                // 🛑 CORREGIDO: Jala las columnas reales que sí existen en tu base de datos
                multa.put("user", rs.getString("usuario")); 
                multa.put("book", rs.getString("libro"));
                multa.put("reason", rs.getString("motivo"));
                
                multa.put("amount", rs.getDouble("monto"));
                multa.put("date", rs.getString("fecha_creacion"));
                multa.put("status", rs.getString("estado"));
                multas.add(multa);
            }
        } catch (Exception e) {
            System.err.println("Error crítico al recuperar multas de MySQL: " + e.getMessage());
        }
        response.getWriter().print(new Gson().toJson(multas));
    }

    // PAGAR LA MULTA (POST)
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            BufferedReader reader = request.getReader();
            Map data = new Gson().fromJson(reader, Map.class);
            int multaId = ((Double) data.get("multaId")).intValue();

            try (Connection con = ConexionDB.getConnection();
                 PreparedStatement ps = con.prepareStatement("UPDATE multas SET estado = 'Pagado' WHERE id = ?")) {
                ps.setInt(1, multaId);
                ps.executeUpdate();
            }
            response.setContentType("application/json");
            response.getWriter().print("{\"status\":\"ok\"}");
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
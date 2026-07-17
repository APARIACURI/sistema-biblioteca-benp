package com.benp.controlador;

import com.benp.dao.UsuarioDAO;
import com.benp.modelo.Usuario;
import com.google.gson.Gson;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException; // Agregada importación de SQL
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet(name = "UsuarioServlet", urlPatterns = {"/api/usuarios"})
public class UsuarioServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        try (PrintWriter out = response.getWriter()) {
            BufferedReader reader = request.getReader();
            Gson gson = new Gson();
            
            Usuario nuevoUsuario = gson.fromJson(reader, Usuario.class);
            UsuarioDAO dao = new UsuarioDAO();
            
            try {
                // 1. Intenta ejecutar la inserción
                boolean exito = dao.registrarUsuario(nuevoUsuario);
                
                if(exito) {
                    out.print("{\"mensaje\": \"Usuario registrado correctamente\", \"status\": \"success\"}");
                } else {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    out.print("{\"mensaje\": \"Error al registrar en la base de datos\", \"status\": \"error\"}");
                }
            } catch (SQLException e) {
                // 🛑 CORREGIDO: Atrapa el error de duplicidad, cambia a estado 409 y manda el mensaje real
                response.setStatus(HttpServletResponse.SC_CONFLICT); // HTTP 409 Conflict
                out.print("{\"mensaje\": \"" + e.getMessage() + "\", \"status\": \"error\"}");
            }
            out.flush();
        }
    }
}

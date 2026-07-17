/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package com.benp.controlador;

import com.benp.dao.UsuarioDAO;
import com.benp.modelo.Usuario;
import com.google.gson.Gson;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet(name = "LoginServlet", urlPatterns = {"/api/login"})
public class LoginServlet extends HttpServlet {

   private static final java.util.logging.Logger LOGGER = java.util.logging.Logger.getLogger("com.benp");

    private static class Credenciales {
        String correo;
        String clave;
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        try (PrintWriter out = response.getWriter()) {
            BufferedReader reader = request.getReader();
            Gson gson = new Gson();
            
            // 2. Ahora Gson sí puede convertir el JSON sin "explotar"
            Credenciales creds = gson.fromJson(reader, Credenciales.class);
            
            UsuarioDAO dao = new UsuarioDAO();
            Usuario usuarioAutenticado = dao.autenticar(creds.correo, creds.clave);
            
            if(usuarioAutenticado != null) {
                // Login correcto
                out.print(gson.toJson(usuarioAutenticado));
            } else {
                // Credenciales no coinciden en SQL
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                out.print("{\"mensaje\": \"Credenciales incorrectas\"}");
            }
            out.flush();
        } catch (Exception e) {
            // Captura de errores para evitar que se cuelgue
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            System.err.println("Error en LoginServlet: " + e.getMessage());
        }
    }
}
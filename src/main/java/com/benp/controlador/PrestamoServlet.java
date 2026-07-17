/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package com.benp.controlador;

import com.benp.dao.PrestamoDAO;
import com.benp.modelo.Prestamo;
import com.google.gson.Gson;
import java.io.BufferedReader;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet(name = "PrestamoServlet", urlPatterns = {"/api/prestamos", "/api/prestamos/listar", "/api/prestamos/estado"})
public class PrestamoServlet extends HttpServlet {

    private final PrestamoDAO prestamoDAO = new PrestamoDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        List<Prestamo> lista = prestamoDAO.listarTodos();
        response.getWriter().print(gson.toJson(lista));
    }

     @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        String path = request.getServletPath();
        BufferedReader reader = request.getReader();
        Map<String, Object> data = gson.fromJson(reader, Map.class);

        // Si la ruta es /api/prestamos/estado -> El Admin está Entregando o Recibiendo Devoluciones
        if ("/api/prestamos/estado".equals(path)) {
            int prestamoId = ((Double) data.get("prestamoId")).intValue();
            String nuevoEstado = (String) data.get("nuevoEstado");
            
            // 🌟 TRUCO MAESTRO: Captura segura libre de ClassCastException para decimales o enteros
            double montoMulta = 0.0;
            if (data.containsKey("montoMulta") && data.get("montoMulta") != null) {
                try {
                    montoMulta = Double.parseDouble(String.valueOf(data.get("montoMulta")));
                } catch (NumberFormatException e) {
                    System.err.println("Aviso: Formato de monto no numérico recibido: " + e.getMessage());
                }
            }
            
            String descripcionAdmin = data.containsKey("descripcion") ? (String) data.get("descripcion") : "Procesamiento ordinario";
            
            // Invocamos la persistencia en MySQL pasando los 4 parámetros ordenados
            prestamoDAO.actualizarEstadoPrestamo(prestamoId, nuevoEstado, montoMulta, descripcionAdmin);
            response.getWriter().print("{\"status\":\"ok\"}");
        } 
        // Si es /api/prestamos -> El Alumno está Reservando desde el Carrito
        else {
            int libroId = ((Double) data.get("libroId")).intValue();
            String titulo = (String) data.get("titulo");
            String usuario = (String) data.get("usuario");
            String diasPrestamo = data.containsKey("tiempoPrestamo") ? (String) data.get("tiempoPrestamo") : "3_dias";
            
            int reservasActivas = prestamoDAO.contarPrestamosActivosPorUsuario(usuario);
            if (reservasActivas >= 3) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().print("{\"status\":\"error\", \"mensaje\":\"Límite excedido: Ya posees 3 reservas activas.\"}");
                return;
            }
            
            boolean guardado = prestamoDAO.registrarPrestamo(libroId, titulo, usuario, diasPrestamo);
            if (guardado) {
                response.getWriter().print("{\"status\":\"ok\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().print("{\"status\":\"error\", \"mensaje\":\"Sin stock de copias físicas.\"}");
            }
        }
    }
}
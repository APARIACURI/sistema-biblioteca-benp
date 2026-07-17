/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.benp.controlador;

import com.benp.dao.EjemplarDAO;
import com.benp.modelo.Ejemplar;
import com.google.gson.Gson;
import java.io.BufferedReader;
import java.io.IOException;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;

@WebServlet(name = "EjemplarServlet", urlPatterns = {"/api/ejemplares"})
public class EjemplarServlet extends HttpServlet {

    // 🟢 MÉTODO GET: Sirve para MOSTRAR únicamente los ejemplares del libro seleccionado
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        String paramId = request.getParameter("libroId");
        if (paramId != null && !paramId.trim().isEmpty()) {
            int libroId = Integer.parseInt(paramId);
            EjemplarDAO dao = new EjemplarDAO();
            List<Ejemplar> lista = dao.listarPorLibro(libroId);
            response.getWriter().print(new Gson().toJson(lista));
        } else {
            response.getWriter().print("[]");
        }
    }

    // 🟢 MÉTODO POST: Sirve para GUARDAR un nuevo ejemplar físico en los estantes (Alta)
 @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        
        try {
            // Leemos el JSON completo en una sola cadena de texto para que no se destruya el lector
            StringBuilder sb = new StringBuilder();
            String linea;
            try (BufferedReader reader = request.getReader()) {
                while ((linea = reader.readLine()) != null) {
                    sb.append(linea);
                }
            }
            
            String jsonTexto = sb.toString();
            Gson gson = new Gson();
            
            // Convertimos la cadena de texto a un objeto JSON puro del motor Gson
            com.google.gson.JsonObject jsonObject = gson.fromJson(jsonTexto, com.google.gson.JsonObject.class);
            
            Ejemplar nuevo = new Ejemplar();
            
            // 🛑 EXTRACCIÓN EXPLÍCITA DIRECTA DE TEXTO (Evita que viaje null a MySQL)
            if (jsonObject != null) {
                // Buscamos el ID en formato CamelCase o SnakeCase de respaldo
                if (jsonObject.has("libroId")) nuevo.setLibroId(jsonObject.get("libroId").getAsInt());
                else if (jsonObject.has("libro_id")) nuevo.setLibroId(jsonObject.get("libro_id").getAsInt());
                
                if (jsonObject.has("codigoEjemplar")) nuevo.setCodigoEjemplar(jsonObject.get("codigoEjemplar").getAsString());
                else if (jsonObject.has("codigo_ejemplar")) nuevo.setCodigoEjemplar(jsonObject.get("codigo_ejemplar").getAsString());
                
                // Captura el valor exacto escrito en tu formulario flotante de React
                if (jsonObject.has("ubicacion")) nuevo.setUbicacion(jsonObject.get("ubicacion").getAsString());
                else if (jsonObject.has("ubicación")) nuevo.setUbicacion(jsonObject.get("ubicación").getAsString());
                
                if (jsonObject.has("estado")) nuevo.setEstado(jsonObject.get("estado").getAsString());
                
                if (jsonObject.has("anioImpresion")) nuevo.setAnioImpresion(jsonObject.get("anioImpresion").getAsString());
                else if (jsonObject.has("anio_impresion")) nuevo.setAnioImpresion(jsonObject.get("anio_impresion").getAsString());
            }
            
            // Control de seguridad por si enviaron campos vacíos en el formulario
            if (nuevo.getUbicacion() == null || nuevo.getUbicacion().trim().isEmpty()) {
                nuevo.setUbicacion("Almacén General");
            }
            if (nuevo.getEstado() == null) nuevo.setEstado("Disponible");
            if (nuevo.getAnioImpresion() == null) nuevo.setAnioImpresion("2026");
            
            EjemplarDAO dao = new EjemplarDAO();
            boolean exito = dao.insertarEjemplar(nuevo);
            
            if (exito) {
                response.getWriter().print("{\"status\":\"ok\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().print("{\"status\":\"error\"}");
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            System.err.println("Falla crítica en procesamiento de EjemplarServlet: " + e.getMessage());
        }
    }

    // 🟢 MÉTODO PUT: Sirve para ACTUALIZAR (Editar) el estado o ubicación de una copia física
    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        
        try {
            BufferedReader reader = request.getReader();
            Gson gson = new Gson();
            Ejemplar data = gson.fromJson(reader, Ejemplar.class);
            
            EjemplarDAO dao = new EjemplarDAO();
            boolean exito = dao.actualizarEjemplar(data.getId(), data.getUbicacion(), data.getEstado(), data.getAnioImpresion());
            
            if (exito) {
                response.getWriter().print("{\"status\":\"ok\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}


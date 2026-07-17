/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.benp.controlador;

import com.benp.dao.CategoriaDAO;
import com.benp.modelo.Categoria;
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

/**
 *
 * @author elias
 */
@WebServlet(name = "CategoriaServlet", urlPatterns = {"/api/categorias", "/api/categorias/estado"})
public class CategoriaServlet extends HttpServlet {

    private final CategoriaDAO categoriaDAO = new CategoriaDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        List<Categoria> lista = categoriaDAO.listarTodas();
        response.getWriter().print(gson.toJson(lista));
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        String path = request.getServletPath();
        BufferedReader reader = request.getReader();
        Map<String, Object> data = gson.fromJson(reader, Map.class);

        if ("/api/categorias/estado".equals(path)) {
            int id = ((Double) data.get("id")).intValue();
            String nuevoEstado = (String) data.get("nuevoEstado");
            categoriaDAO.conmutarEstado(id, nuevoEstado);
            response.getWriter().print("{\"status\":\"ok\"}");
        } else {
            String nombre = (String) data.get("nombre");
            String descripcion = (String) data.get("descripcion");
            String estado = (String) data.get("estado");
            categoriaDAO.registrarCategoria(nombre, descripcion, estado);
            response.getWriter().print("{\"status\":\"ok\"}");
        }
    }
}

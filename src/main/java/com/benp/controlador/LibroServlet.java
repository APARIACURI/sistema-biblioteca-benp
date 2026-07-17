/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package com.benp.controlador;

import com.benp.dao.LibroDAO;
import com.benp.modelo.Libro;
import com.google.gson.Gson;
import java.io.BufferedReader;
import java.io.File; //Para poder crear carpetas físicas en el disco duro
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.logging.Logger; 
import java.util.logging.Level;  
import java.util.logging.FileHandler; //El motor que escribe físicamente el archivo TXT
import java.util.logging.SimpleFormatter; //Para darle un diseño limpio al texto del log
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;

@WebServlet(name = "LibroServlet", urlPatterns = {"/api/libros"})
public class LibroServlet extends HttpServlet {

    // 🌟 LA LÍNEA MÁGICA CONECTADA AQUÍ ARRIBA
    private static final java.util.logging.Logger LOGGER = java.util.logging.Logger.getLogger("com.benp");

    // 🛑 CONFIGURACIÓN DE LOS 3 ARCHIVOS .TXT SOLICITADOS POR EL PROFESOR
     static {
        try {
            java.io.File carpeta = new java.io.File("C:/biblioteca_logs");
            if (!carpeta.exists()) {
                carpeta.mkdirs();
            }

            // ARCHIVO 1: info.txt
            java.util.logging.FileHandler info = new java.util.logging.FileHandler("C:/biblioteca_logs/info.txt", 20480, 1, true);
            info.setFormatter(new java.util.logging.SimpleFormatter());
            info.setFilter(record -> record.getLevel() == java.util.logging.Level.INFO);
            LOGGER.addHandler(info); 

            // ARCHIVO 2: warning.txt
            java.util.logging.FileHandler warn = new java.util.logging.FileHandler("C:/biblioteca_logs/warning.txt", 20480, 1, true);
            warn.setFormatter(new java.util.logging.SimpleFormatter());
            warn.setFilter(record -> record.getLevel() == java.util.logging.Level.WARNING);
            LOGGER.addHandler(warn); // 

            // ARCHIVO 3: error.txt
            java.util.logging.FileHandler err = new java.util.logging.FileHandler("C:/biblioteca_logs/error.txt", 20480, 1, true);
            err.setFormatter(new java.util.logging.SimpleFormatter());
            err.setLevel(java.util.logging.Level.SEVERE);
            LOGGER.addHandler(err); 

            LOGGER.info("=== SISTEMA DE AUDITORÍA MAVEN INICIALIZADO AUTOMÁTICAMENTE ===");

        } catch (Exception e) {
            System.err.println("Error al levantar los manejadores de texto: " + e.getMessage());
        }
    }

    private static class LibroJSON {
        int id; 
        String titulo; 
        String autor; 
        String categoria;
        String editorial; 
        String anio; 
        String isbn; 
        String imagenUrl;
        int stock; 
        String estado; 
    }

    // --- METODO GET: Sirve para MOSTRAR los libros en el catálogo ---
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        LOGGER.info("Petición GET recibida en /api/libros. Solicitando catálogo de libros.");
        
        try (PrintWriter out = response.getWriter()) {
            LibroDAO dao = new LibroDAO();
            List<Libro> listaLibros = dao.listarTodos();
            
            Gson gson = new Gson();
            String jsonRespuesta = gson.toJson(listaLibros);
            
            LOGGER.log(Level.INFO, "Catálogo recuperado con éxito. Cantidad de registros enviados: {0}", listaLibros.size());
            
            out.print(jsonRespuesta);
            out.flush();
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Fallo al procesar el catálogo general GET: {0}", e.getMessage());
        }
    }

    // --- METODO POST: Sirve para GUARDAR un libro nuevo ---
   @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        LOGGER.info("Petición POST recibida en /api/libros. Iniciando registro de nuevo libro.");
        
        try {
            BufferedReader reader = request.getReader();
            Gson gson = new Gson();
            
            // Leemos el JSON enviado por React de forma elástica usando un Mapa genérico
            Map<String, Object> data = gson.fromJson(reader, Map.class);
            
            // Construimos el objeto Libro oficial para pasárselo al DAO
            com.benp.modelo.Libro nuevoLibro = new com.benp.modelo.Libro();
            nuevoLibro.setTitulo((String) data.get("titulo"));
            nuevoLibro.setAutor((String) data.get("autor"));
            nuevoLibro.setCategoria((String) data.get("categoria")); // Pasa el texto por si el DAO hace la subconsulta
            nuevoLibro.setEditorial((String) data.get("editorial"));
            nuevoLibro.setAnio((String) data.get("anio"));
            nuevoLibro.setIsbn((String) data.get("isbn"));
            nuevoLibro.setImagenUrl((String) data.get("imagenUrl"));
            
            // Manejo elástico del stock
            int stockFinal = 5;
            if (data.containsKey("stock") && data.get("stock") != null) {
                stockFinal = ((Double) data.get("stock")).intValue();
            }
            nuevoLibro.setStock(stockFinal);

            LOGGER.log(Level.INFO, "Estructurando inserción para el libro: ''{0}'' por el autor: {1}", new Object[]{nuevoLibro.getTitulo(), nuevoLibro.getAutor()});
            
            // 🚀 LLAMADA CORREGIDA: Le pasamos el objeto tipado Libro que tu DAO espera recibir
            LibroDAO dao = new LibroDAO();
            boolean guardado = dao.registrarLibro(nuevoLibro);
            
            if (guardado) {
                LOGGER.info("Transacción de inserción concluida con éxito. Registro guardado en MySQL.");
                response.getWriter().print("{\"status\":\"ok\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().print("{\"status\":\"error\", \"mensaje\":\"Falla en inserción relacional\"}");
            }
            
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fatal detectado en LibroServlet POST: {0}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().print("{\"status\":\"error\", \"mensaje\":\"" + e.getMessage() + "\"}");
        }
    }

    // --- MÉTODO PUT: Recibe los datos mutados desde el formulario de edición de React ---
    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        
        LOGGER.info("Petición PUT recibida en /api/libros. Iniciando proceso de actualización.");
        
        try (PrintWriter out = response.getWriter()) {
            BufferedReader reader = request.getReader();
            Gson gson = new Gson();
            
            LibroJSON data = gson.fromJson(reader, LibroJSON.class);
            
            Libro libroEditado = new Libro();
            libroEditado.setId(data.id);
            libroEditado.setTitulo(data.titulo);
            libroEditado.setAutor(data.autor);
            libroEditado.setCategoria(data.categoria);
            libroEditado.setEditorial(data.editorial);
            libroEditado.setAnio(data.anio);
            libroEditado.setIsbn(data.isbn);
            libroEditado.setImagenUrl(data.imagenUrl);
            libroEditado.setStock(data.stock);
            libroEditado.setEstado(data.estado);
            
            LOGGER.log(Level.INFO, "Enviando comando UPDATE al DAO para el libro con identificador ID: {0}", data.id);
            
            LibroDAO dao = new LibroDAO();
            boolean exito = dao.actualizarLibroCompleto(libroEditado);
            
            if (exito) {
                LOGGER.log(Level.INFO, "Fila modificada con éxito en la base de datos para el ID: {0}", data.id);
                out.print("{\"status\":\"ok\", \"mensaje\":\"Libro actualizado correctamente\"}");
            } else {
                LOGGER.log(Level.WARNING, "El UPDATE falló. No se encontró ninguna fila que coincida con el ID: {0}", data.id);
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\"status\":\"error\", \"mensaje\":\"No se pudo actualizar el libro en la base de datos\"}");
            }
            out.flush();
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Falla crítica e interrupción en la actualización PUT: {0}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
   
}
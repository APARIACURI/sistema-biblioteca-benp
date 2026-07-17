/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.benp.dao;

import com.benp.modelo.Prestamo;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.ArrayList;

public class PrestamoDAO {

    // 🛑 ASIGNACIÓN DE COPIA DISPONIBLE Y TOKEN CIFRADO (PUNTO 5)=
    public boolean registrarPrestamo(int libroId, String titulo, String usuario, String diasPrestamo) {
        Connection con = null;
        PreparedStatement psBuscar = null;
        PreparedStatement psActualizarEjemplar = null;
        PreparedStatement psInsertarPrestamo = null;
        PreparedStatement psRestarStock = null;
        ResultSet rs = null;

        int dias = 3;
        if ("5_dias".equals(diasPrestamo)) dias = 5;
        if ("1_semana".equals(diasPrestamo)) dias = 7;

        try {
            con = ConexionDB.getConnection();
            con.setAutoCommit(false); 

            // 1. Buscamos el primer ejemplar físico disponible
            String sqlBuscar = "SELECT id, codigo_ejemplar FROM ejemplares WHERE libro_id = ? AND estado = 'Disponible' LIMIT 1 FOR UPDATE";
            psBuscar = con.prepareStatement(sqlBuscar);
            psBuscar.setInt(1, libroId);
            rs = psBuscar.executeQuery();

            String codigoCopiaAsignada = "N/A";
            if (rs.next()) {
                codigoCopiaAsignada = rs.getString("codigo_ejemplar");
                int ejemplarIdReal = rs.getInt("id");

                // 2. Modificamos el estado de esa copia física a 'Reservado'
                String sqlActEjemplar = "UPDATE ejemplares SET estado = 'Reservado' WHERE id = ?";
                psActualizarEjemplar = con.prepareStatement(sqlActEjemplar);
                psActualizarEjemplar.setInt(1, ejemplarIdReal);
                psActualizarEjemplar.executeUpdate();
            } else {
                con.rollback();
                return false;
            }

            // 3. Generamos el código único cifrado (SHA-256)
            String semillaPlana = usuario + libroId + System.currentTimeMillis();
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(semillaPlana.getBytes("UTF-8"));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            String tokenCifradoFinal = hexString.toString().substring(0, 8).toUpperCase();

            // 4. Inserción física de la reserva vinculando el ejemplar asignado
            String sqlInsertar = "INSERT INTO prestamos (libro_id, ejemplar_codigo, nombre_usuario, fecha_prestamo, fecha_vencimiento, estado, codigo_recojo_cifrado) " +
                                 "VALUES (?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY), 'Pendiente', ?)";
            psInsertarPrestamo = con.prepareStatement(sqlInsertar);
            psInsertarPrestamo.setInt(1, libroId);
            psInsertarPrestamo.setString(2, codigoCopiaAsignada);
            psInsertarPrestamo.setString(3, usuario);
            psInsertarPrestamo.setInt(4, dias);
            psInsertarPrestamo.setString(5, tokenCifradoFinal);
            psInsertarPrestamo.executeUpdate();

            // 5. Restamos stock digital general
            String sqlRestar = "UPDATE libros SET stock = GREATEST(stock - 1, 0) WHERE id = ?";
            psRestarStock = con.prepareStatement(sqlRestar);
            psRestarStock.setInt(1, libroId);
            psRestarStock.executeUpdate();

            con.commit(); 
            return true;

        } catch (Exception ex) {
            System.err.println("Falla crítica transaccional en el Punto 5: " + ex.getMessage());
            if (con != null) {
                try { con.rollback(); } catch (SQLException e) {}
            }
            return false;
        } finally {
            try {
                if (rs != null) rs.close();
                if (psBuscar != null) psBuscar.close();
                if (psActualizarEjemplar != null) psActualizarEjemplar.close();
                if (psInsertarPrestamo != null) psInsertarPrestamo.close();
                if (psRestarStock != null) psRestarStock.close();
                if (con != null) con.close();
            } catch (SQLException e) {}
        }
    }

    // RECONSTRUIDO - PUNTO 6: CONTROL DE ESTADOS CON AUDITORÍA DE DAÑOS Y MULTAS
       public void actualizarEstadoPrestamo(int prestamoId, String nuevoEstado, double montoMulta, String descripcionAdmin) {
        String sqlPrestamo = "";
        String sqlStock = "";
        String sqlLiberarEjemplar = "";
        String sqlMulta = "";

        // 🌟 PASO CRÍTICO: Rescatamos el ID del libro de forma aislada para romper el bloqueo de MySQL
        int idLibroAsociado = 0;
        String sqlTraerLibroId = "SELECT libro_id FROM prestamos WHERE id = ?";
        String tituloLibroAux = "Recurso Institucional";
        String sqlTraerTitulo = "SELECT l.titulo FROM libros l INNER JOIN prestamos p ON p.libro_id = l.id WHERE p.id = ?";
        
        try (Connection conAux = ConexionDB.getConnection()) {
            // 1. Capturamos el ID del libro
            try (PreparedStatement psL = conAux.prepareStatement(sqlTraerLibroId)) {
                psL.setInt(1, prestamoId);
                try (ResultSet rsL = psL.executeQuery()) {
                    if (rsL.next()) idLibroAsociado = rsL.getInt("libro_id");
                }
            }
            // 2. Capturamos el Título del libro
            try (PreparedStatement psT = conAux.prepareStatement(sqlTraerTitulo)) {
                psT.setInt(1, prestamoId);
                try (ResultSet rsT = psT.executeQuery()) {
                    if (rsT.next()) tituloLibroAux = rsT.getString("titulo");
                }
            }
        } catch (SQLException e) {
            System.err.println("Error al aislar IDs de préstamo: " + e.getMessage());
        }

        // Definimos las operaciones limpias usando el ID directo obtenido arriba libre de bloqueos
        if (nuevoEstado.equals("Activo")) {
            sqlPrestamo = "UPDATE prestamos SET estado = ?, fecha_entrega = CURDATE() WHERE id = ?";
            sqlLiberarEjemplar = "UPDATE ejemplares SET estado = 'Prestado' WHERE codigo_ejemplar = (SELECT ejemplar_codigo FROM prestamos WHERE id = ?)";
        } 
        else if (nuevoEstado.equals("Devuelto")) {
            sqlPrestamo = "UPDATE prestamos SET estado = ?, fecha_devolucion_real = CURDATE() WHERE id = ?";
            
            // 🚀 OPERACIÓN LIMPIA: Suma 1 al stock digital directo usando el ID numérico aislado
            sqlStock = "UPDATE libros SET stock = stock + 1 WHERE id = ?";
            
            if (montoMulta >= 50.0) { 
                sqlLiberarEjemplar = "UPDATE ejemplares SET estado = 'Pésimo' WHERE codigo_ejemplar = (SELECT ejemplar_codigo FROM prestamos WHERE id = ?)";
            } else {
                sqlLiberarEjemplar = "UPDATE ejemplares SET estado = 'Disponible' WHERE codigo_ejemplar = (SELECT ejemplar_codigo FROM prestamos WHERE id = ?)";
            }

            if (montoMulta > 0) {
                sqlMulta = "INSERT INTO multas (usuario, libro, motivo, monto, estado, fecha_creacion) " +
                           "VALUES ((SELECT nombre_usuario FROM prestamos WHERE id = ?), ?, ?, ?, 'Pendiente', CURDATE())";
            }
        } 
        else if (nuevoEstado.equals("Cancelado")) {
            sqlPrestamo = "UPDATE prestamos SET estado = ? WHERE id = ?";
            
            // 🚀 OPERACIÓN LIMPIA: Devuelve la unidad al stock al cancelarse la solicitud
            sqlStock = "UPDATE libros SET stock = stock + 1 WHERE id = ?";
            sqlLiberarEjemplar = "UPDATE ejemplares SET estado = 'Disponible' WHERE codigo_ejemplar = (SELECT ejemplar_codigo FROM prestamos WHERE id = ?)";
        }
        else {
            sqlPrestamo = "UPDATE prestamos SET estado = ? WHERE id = ?";
        }

        // Ejecución atómica de la transacción
        try (Connection con = ConexionDB.getConnection()) {
            con.setAutoCommit(false);

            if (!sqlPrestamo.isEmpty()) {
                try (PreparedStatement ps = con.prepareStatement(sqlPrestamo)) {
                    ps.setString(1, nuevoEstado);
                    ps.setInt(2, prestamoId);
                    ps.executeUpdate();
                }
            }

            // 🚀 EL CAMBIO DE STOCK AHORA ES DIRECTO Y SE EJECUTA CON ÉXITO INSTANTÁNEO
            if (!sqlStock.isEmpty() && idLibroAsociado > 0) {
                try (PreparedStatement psStock = con.prepareStatement(sqlStock)) {
                    psStock.setInt(1, idLibroAsociado); // Pasa el ID directo aislado
                    psStock.executeUpdate();
                }
            }

            if (!sqlLiberarEjemplar.isEmpty()) {
                try (PreparedStatement psEjemplar = con.prepareStatement(sqlLiberarEjemplar)) {
                    psEjemplar.setInt(1, prestamoId);
                    psEjemplar.executeUpdate();
                }
            }

            if (!sqlMulta.isEmpty()) {
                try (PreparedStatement psMulta = con.prepareStatement(sqlMulta)) {
                    psMulta.setInt(1, prestamoId);      
                    psMulta.setString(2, tituloLibroAux); 
                    psMulta.setString(3, descripcionAdmin); 
                    psMulta.setDouble(4, montoMulta);       
                    psMulta.executeUpdate();
                }
            }

            con.commit(); // Consolidación absoluta en MySQL
        } catch (SQLException e) {
            System.err.println("Error crítico transaccional en actualización de estado: " + e.getMessage());
        }
    }
    //  LISTAR TODOS CORREGIDO: SE QUITÓ 'titulo_libro' FANTASMA PARA EVITAR EL CRASH 
public List<Prestamo> listarTodos() {
        List<Prestamo> lista = new ArrayList<>();
        
        // El INNER JOIN amarra la tabla préstamos con la tabla usuarios concatenando Nombre y Apellido
        String sql = "SELECT p.*, l.titulo AS libro_titulo, u.dni AS usuario_dni FROM prestamos p " +
                     "INNER JOIN libros l ON p.libro_id = l.id " +
                     "INNER JOIN usuarios u ON p.nombre_usuario = CONCAT(u.nombre, ' ', u.apellido) " +
                     "ORDER BY p.id DESC"; 
                     
        try (Connection con = ConexionDB.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
             
            while (rs.next()) {
                Prestamo p = new Prestamo();
                p.setId(rs.getInt("id"));
                p.setLibroId(rs.getInt("libro_id"));
                p.setTituloLibro(rs.getString("libro_titulo"));
                p.setNombreUsuario(rs.getString("nombre_usuario"));
                p.setFechaPrestamo(rs.getString("fecha_prestamo"));
                p.setEstado(rs.getString("estado"));                
                p.setFechaEntrega(rs.getString("fecha_entrega"));
                p.setFechaVencimiento(rs.getString("fecha_vencimiento"));
                p.setFechaDevolucionReal(rs.getString("fecha_devolucion_real"));     
                p.setEjemplarCodigo(rs.getString("ejemplar_codigo"));
                
                // 🚀 TRUCO MAESTRO: Guardamos el DNI real dentro de la variable 'codigoRecojoCifrado' 
                // separándolo con un carácter especial para enviarlo en el mismo JSON sin alterar tu clase Prestamo.java
                String tokenOriginal = rs.getString("codigo_recojo_cifrado");
                String dniReal = rs.getString("usuario_dni");
                p.setCodigoRecojoCifrado(tokenOriginal + "|" + dniReal);
                
                lista.add(p);
            }
        } catch (SQLException e) { 
            System.err.println("Error crítico al listar préstamos con DNI: " + e.getMessage());
        }
        return lista;
    }
    // REGLA DE CUOTAS DEL PUNTO 3
    public int contarPrestamosActivosPorUsuario(String usuario) {
        String sql = "SELECT COUNT(*) FROM prestamos WHERE nombre_usuario = ? AND (estado = 'Pendiente' || estado = 'Activo')";
        try (Connection con = ConexionDB.getConnection(); PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, usuario);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error al contar cuotas: " + e.getMessage());
        }
        return 0;
    }
}

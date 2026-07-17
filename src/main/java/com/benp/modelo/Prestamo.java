    /*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.benp.modelo;

public class Prestamo {
    private int id;
    private int libroId;
    private String tituloLibro; // Dato auxiliar para mostrar en la tabla fácilmente
    private String nombreUsuario; // Dato auxiliar
    private String fechaPrestamo;
    private String estado; // "Pendiente", "Activo", "Devuelto"
    private String fechaEntrega;
    private String fechaVencimiento;
    private String fechaDevolucionReal;
    private String ejemplarCodigo;
    private String codigoRecojoCifrado;

    public Prestamo() {}

    // --- Getters y Setters ---
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getLibroId() { return libroId; }
    public void setLibroId(int libroId) { this.libroId = libroId; }

    public String getTituloLibro() { return tituloLibro; }
    public void setTituloLibro(String tituloLibro) { this.tituloLibro = tituloLibro; }

    public String getNombreUsuario() { return nombreUsuario; }
    public void setNombreUsuario(String nombreUsuario) { this.nombreUsuario = nombreUsuario; }

    public String getFechaPrestamo() { return fechaPrestamo; }
    public void setFechaPrestamo(String fechaPrestamo) { this.fechaPrestamo = fechaPrestamo; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    // --- GETTERS Y SETTERS DE LAS FECHAS NUEVAS ---
    public String getFechaEntrega() { return fechaEntrega; }
    public void setFechaEntrega(String fechaEntrega) { this.fechaEntrega = fechaEntrega; }

    public String getFechaVencimiento() { return fechaVencimiento; }
    public void setFechaVencimiento(String fechaVencimiento) { this.fechaVencimiento = fechaVencimiento; }

    public String getFechaDevolucionReal() { return fechaDevolucionReal; }
    public void setFechaDevolucionReal(String fechaDevolucionReal) { this.fechaDevolucionReal = fechaDevolucionReal; }
    
    public String getEjemplarCodigo() { return ejemplarCodigo; }
    public void setEjemplarCodigo(String ejemplarCodigo) { this.ejemplarCodigo = ejemplarCodigo; }
    
    public String getCodigoRecojoCifrado() { return codigoRecojoCifrado; }
    public void setCodigoRecojoCifrado(String codigoRecojoCifrado) { this.codigoRecojoCifrado = codigoRecojoCifrado; }
}

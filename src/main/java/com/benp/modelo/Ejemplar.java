/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.benp.modelo;

public class Ejemplar {
    private int id;
    private int libroId; // Gson mapeará tanto libroId como libro_id si se requiere
    private String codigoEjemplar;
    private String ubicacion;      
    private String estado;
    private String anioImpresion;

    // Getters y Setters standard
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    
    public int getLibroId() { return libroId; }
    public void setLibroId(int libroId) { this.libroId = libroId; }
    public String getCodigoEjemplar() { return codigoEjemplar; }
    
    public void setCodigoEjemplar(String codigoEjemplar) { this.codigoEjemplar = codigoEjemplar; }
    public String getUbicacion() { return ubicacion; }
    
    public void setUbicacion(String ubicacion) { this.ubicacion = ubicacion; }
    public String getEstado() { return estado; }
    
    public void setEstado(String estado) { this.estado = estado; }
    public String getAnioImpresion() { return anioImpresion; }
    
    public void setAnioImpresion(String anioImpresion) { this.anioImpresion = anioImpresion; }
}

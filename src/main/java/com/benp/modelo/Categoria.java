/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.benp.modelo;

public class Categoria {
    private int id;
    private String name;
    private String descripcion;
    private String estado;

    public Categoria() {}

    public Categoria(int id, String name, String descripcion, String estado) {
        this.id = id;
        this.name = name;
        this.descripcion = descripcion;
        this.estado = estado;
    }

    // Getters y Setters obligatorios para Gson
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}
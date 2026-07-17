/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.benp.modelo;

public class Multa {
    private int id;
    private String nombreUsuario;
    private double monto;
    private String motivo;
    private String estado; // "Pendiente", "Pagado"
    private String tituloLibro;
    private int diasRetraso;
    private String fechaMulta;

    public Multa() {}

    public Multa(int id, String nombreUsuario, double monto, String motivo, String estado, String tituloLibro, int diasRetraso, String fechaMulta) {
        this.id = id;
        this.nombreUsuario = nombreUsuario;
        this.monto = monto;
        this.motivo = motivo;
        this.estado = estado;
        this.tituloLibro = tituloLibro;
        this.diasRetraso = diasRetraso;
        this.fechaMulta = fechaMulta;
    }

    // --- Getters y Setters ---
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getNombreUsuario() { return nombreUsuario; }
    public void setNombreUsuario(String nombreUsuario) { this.nombreUsuario = nombreUsuario; }

    public double getMonto() { return monto; }
    public void setMonto(double monto) { this.monto = monto; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getTituloLibro() { return tituloLibro; }
    public void setTituloLibro(String tituloLibro) { this.tituloLibro = tituloLibro; }

    public int getDiasRetraso() { return diasRetraso; }
    public void setDiasRetraso(int diasRetraso) { this.diasRetraso = diasRetraso; }

    public String getFechaMulta() { return fechaMulta; }
    public void setFechaMulta(String fechaMulta) { this.fechaMulta = fechaMulta; }
}
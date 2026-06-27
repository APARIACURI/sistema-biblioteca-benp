package com.benp.dto;

// Cuerpo que envia React al entregar/recibir: { prestamoId, nuevoEstado, libroId }
public class EstadoPrestamoRequestDTO {
    private Integer prestamoId;
    private String nuevoEstado;
    private Integer libroId;

    public Integer getPrestamoId() { return prestamoId; }
    public void setPrestamoId(Integer prestamoId) { this.prestamoId = prestamoId; }

    public String getNuevoEstado() { return nuevoEstado; }
    public void setNuevoEstado(String nuevoEstado) { this.nuevoEstado = nuevoEstado; }

    public Integer getLibroId() { return libroId; }
    public void setLibroId(Integer libroId) { this.libroId = libroId; }
}

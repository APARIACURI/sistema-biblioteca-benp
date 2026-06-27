package com.benp.dto;

// Cuerpo que envia React al reservar: { libroId, titulo, usuario }
public class PrestamoRequestDTO {
    private Integer libroId;
    private String titulo;
    private String usuario;

    public Integer getLibroId() { return libroId; }
    public void setLibroId(Integer libroId) { this.libroId = libroId; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getUsuario() { return usuario; }
    public void setUsuario(String usuario) { this.usuario = usuario; }
}

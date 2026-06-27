package com.benp.dto;

// Espejo de la clase interna "Credenciales" que tenia LoginServlet
public class CredencialesDTO {
    private String correo;
    private String clave;

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    public String getClave() { return clave; }
    public void setClave(String clave) { this.clave = clave; }
}

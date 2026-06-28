package com.benp.dto;

// Lo que el cliente puede enviar al registrarse. A diferencia de usar la entidad
// Usuario directamente, este DTO NO incluye "id" ni "tipoUsuario": evita que
// alguien se registre enviando {"tipoUsuario":"admin"} en el JSON.
public class UsuarioRegistroDTO {
    private String nombre;
    private String apellido;
    private String correo;
    private String numero;
    private String dni;
    private String clave;
    private String apodo;

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }

    public String getDni() { return dni; }
    public void setDni(String dni) { this.dni = dni; }

    public String getClave() { return clave; }
    public void setClave(String clave) { this.clave = clave; }

    public String getApodo() { return apodo; }
    public void setApodo(String apodo) { this.apodo = apodo; }
}

/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.benp.modelo;

public class Usuario {
    private int id;
    private String nombre;
    private String apellido;
    private String correo;
    private String numero;
    private String dni;
    private String clave;
    private String apodo;
    private String tipoUsuario; // "estudiante", "admin", "visitante"

    // Constructor vacío (Obligatorio para los frameworks/DAO)
    public Usuario() {}

    // Constructor con parámetros
    public Usuario(int id, String nombre, String apellido, String correo, String numero, String dni,String clave,String apodo, String tipoUsuario) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.correo = correo;
        this.numero = numero;
        this.dni = dni;
        this.clave = clave;
        this.apodo = apodo;
        this.tipoUsuario = tipoUsuario;
    }

    // --- Getters y Setters ---
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

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

    public String getclave() { return clave; }
    public void setclave(String clave) { this.clave = clave; }
    
    public String getApodo() { return apodo; }
    public void setApodo(String apodo) { this.apodo = apodo; }

    public String getTipoUsuario() { return tipoUsuario; }
    public void setTipoUsuario(String tipoUsuario) { this.tipoUsuario = tipoUsuario; }
}
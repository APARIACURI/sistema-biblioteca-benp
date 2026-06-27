package com.benp.modelo;

import jakarta.persistence.*;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String nombre;
    private String apellido;

    @Column(unique = true)
    private String correo;

    @Column(unique = true)
    private String numero;

    @Column(unique = true)
    private String dni;

    private String clave;
    private String apodo;

    @Column(name = "tipo_usuario") // "estudiante", "admin", "visitante"
    private String tipoUsuario;

    public Usuario() {}

    public Usuario(Integer id, String nombre, String apellido, String correo, String numero, String dni,
                   String clave, String apodo, String tipoUsuario) {
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
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

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

    public String getTipoUsuario() { return tipoUsuario; }
    public void setTipoUsuario(String tipoUsuario) { this.tipoUsuario = tipoUsuario; }
}

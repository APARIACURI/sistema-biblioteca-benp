package com.benp.dto;

import com.benp.modelo.Usuario;

// Lo que se devuelve al frontend tras login/registro: nunca incluye la clave (hash).
public class UsuarioResponseDTO {
    private Integer id;
    private String nombre;
    private String apellido;
    private String correo;
    private String numero;
    private String dni;
    private String apodo;
    private String tipoUsuario;

    public static UsuarioResponseDTO desde(Usuario u) {
        UsuarioResponseDTO dto = new UsuarioResponseDTO();
        dto.id = u.getId();
        dto.nombre = u.getNombre();
        dto.apellido = u.getApellido();
        dto.correo = u.getCorreo();
        dto.numero = u.getNumero();
        dto.dni = u.getDni();
        dto.apodo = u.getApodo();
        dto.tipoUsuario = u.getTipoUsuario();
        return dto;
    }

    public Integer getId() { return id; }
    public String getNombre() { return nombre; }
    public String getApellido() { return apellido; }
    public String getCorreo() { return correo; }
    public String getNumero() { return numero; }
    public String getDni() { return dni; }
    public String getApodo() { return apodo; }
    public String getTipoUsuario() { return tipoUsuario; }
}

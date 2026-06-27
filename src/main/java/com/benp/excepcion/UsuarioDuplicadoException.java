package com.benp.excepcion;

/**
 * Equivalente al manejo del codigo de error 1062 de MySQL (UNIQUE KEY duplicada)
 * que antes se hacia a mano dentro de UsuarioDAO.registrarUsuario().
 */
public class UsuarioDuplicadoException extends RuntimeException {
    public UsuarioDuplicadoException(String mensaje) {
        super(mensaje);
    }
}

package com.benp.modelo;

import jakarta.persistence.*;
import java.time.LocalDate;

/**
 * Nota de migracion: la tabla "multas" original usaba columnas en espanol/abreviadas
 * (usuario, libro, motivo, monto, fecha_creacion, estado) escritas directamente en
 * MultaServlet con SQL crudo. Se respetan esos mismos nombres de columna para no
 * romper la base de datos existente.
 */
@Entity
@Table(name = "multas")
public class Multa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "usuario")
    private String nombreUsuario;

    @Column(name = "libro")
    private String tituloLibro;

    private String motivo;

    private double monto;

    @Column(name = "fecha_creacion")
    private LocalDate fechaMulta;

    private String estado; // "Pendiente", "Pagado"

    public Multa() {}

    // --- Getters y Setters ---
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getNombreUsuario() { return nombreUsuario; }
    public void setNombreUsuario(String nombreUsuario) { this.nombreUsuario = nombreUsuario; }

    public String getTituloLibro() { return tituloLibro; }
    public void setTituloLibro(String tituloLibro) { this.tituloLibro = tituloLibro; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public double getMonto() { return monto; }
    public void setMonto(double monto) { this.monto = monto; }

    public LocalDate getFechaMulta() { return fechaMulta; }
    public void setFechaMulta(LocalDate fechaMulta) { this.fechaMulta = fechaMulta; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}

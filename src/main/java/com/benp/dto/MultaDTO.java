package com.benp.dto;

import com.benp.modelo.Multa;

/**
 * El frontend React (App.jsx / AdminPanel.jsx) espera estas claves exactas
 * en ingles: id, user, book, reason, amount, date, status.
 * Este DTO replica el formato que generaba el Map<String,Object> de MultaServlet.
 */
public class MultaDTO {
    private Integer id;
    private String user;
    private String book;
    private String reason;
    private double amount;
    private String date;
    private String status;

    public static MultaDTO desde(Multa m) {
        MultaDTO dto = new MultaDTO();
        dto.id = m.getId();
        dto.user = m.getNombreUsuario();
        dto.book = m.getTituloLibro();
        dto.reason = m.getMotivo();
        dto.amount = m.getMonto();
        dto.date = m.getFechaMulta() != null ? m.getFechaMulta().toString() : null;
        dto.status = m.getEstado();
        return dto;
    }

    public Integer getId() { return id; }
    public String getUser() { return user; }
    public String getBook() { return book; }
    public String getReason() { return reason; }
    public double getAmount() { return amount; }
    public String getDate() { return date; }
    public String getStatus() { return status; }
}

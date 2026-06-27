package com.benp.dto;

// Cuerpo que envia React al pagar una multa: { multaId }
public class MultaPagoRequestDTO {
    private Integer multaId;

    public Integer getMultaId() { return multaId; }
    public void setMultaId(Integer multaId) { this.multaId = multaId; }
}

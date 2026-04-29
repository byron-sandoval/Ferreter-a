package com.ferronica.app.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link com.ferronica.app.domain.Devolucion} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class DevolucionDTO implements Serializable {

    private Long id;

    private Instant fecha;

    @Size(max = 255)
    private String motivo;

    private BigDecimal total;

    private VentaDTO venta;

    private java.util.Set<DetalleDevolucionDTO> detalles = new java.util.HashSet<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Instant getFecha() {
        return fecha;
    }

    public void setFecha(Instant fecha) {
        this.fecha = fecha;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public VentaDTO getVenta() {
        return venta;
    }

    public void setVenta(VentaDTO venta) {
        this.venta = venta;
    }

    public java.util.Set<DetalleDevolucionDTO> getDetalles() {
        return detalles;
    }

    public void setDetalles(java.util.Set<DetalleDevolucionDTO> detalles) {
        this.detalles = detalles;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof DevolucionDTO)) {
            return false;
        }

        DevolucionDTO devolucionDTO = (DevolucionDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, devolucionDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "DevolucionDTO{" +
                "id=" + getId() +
                ", fecha='" + getFecha() + "'" +
                ", motivo='" + getMotivo() + "'" +
                ", total=" + getTotal() +
                ", venta=" + getVenta() +
                "}";
    }
}

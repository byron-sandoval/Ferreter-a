package com.ferronica.app.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link com.ferronica.app.domain.HistorialPrecio} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class HistorialPrecioDTO implements Serializable {

    private Long id;

    @NotNull
    private BigDecimal precioAnterior;

    @NotNull
    private BigDecimal precioNuevo;

    private Instant fecha;

    @Size(max = 100)
    private String motivo;

    private ArticuloDTO articulo;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getPrecioAnterior() {
        return precioAnterior;
    }

    public void setPrecioAnterior(BigDecimal precioAnterior) {
        this.precioAnterior = precioAnterior;
    }

    public BigDecimal getPrecioNuevo() {
        return precioNuevo;
    }

    public void setPrecioNuevo(BigDecimal precioNuevo) {
        this.precioNuevo = precioNuevo;
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

    public ArticuloDTO getArticulo() {
        return articulo;
    }

    public void setArticulo(ArticuloDTO articulo) {
        this.articulo = articulo;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof HistorialPrecioDTO)) {
            return false;
        }

        HistorialPrecioDTO historialPrecioDTO = (HistorialPrecioDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, historialPrecioDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "HistorialPrecioDTO{" +
                "id=" + getId() +
                ", precioAnterior=" + getPrecioAnterior() +
                ", precioNuevo=" + getPrecioNuevo() +
                ", fecha='" + getFecha() + "'" +
                ", motivo='" + getMotivo() + "'" +
                ", articulo=" + getArticulo() +
                "}";
    }
}

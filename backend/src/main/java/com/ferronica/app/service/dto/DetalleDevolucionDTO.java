package com.ferronica.app.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

/**
 * A DTO for the {@link com.ferronica.app.domain.DetalleDevolucion} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class DetalleDevolucionDTO implements Serializable {

    private Long id;

    @NotNull
    @DecimalMin(value = "0")
    private BigDecimal cantidad;

    @NotNull
    @DecimalMin(value = "0")
    private BigDecimal precioUnitario;

    @NotNull
    @DecimalMin(value = "0")
    private BigDecimal montoTotal;

    private ArticuloDTO articulo;

    private DevolucionDTO devolucion;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getCantidad() {
        return cantidad;
    }

    public void setCantidad(BigDecimal cantidad) {
        this.cantidad = cantidad;
    }

    public BigDecimal getPrecioUnitario() {
        return precioUnitario;
    }

    public void setPrecioUnitario(BigDecimal precioUnitario) {
        this.precioUnitario = precioUnitario;
    }

    public BigDecimal getMontoTotal() {
        return montoTotal;
    }

    public void setMontoTotal(BigDecimal montoTotal) {
        this.montoTotal = montoTotal;
    }

    public ArticuloDTO getArticulo() {
        return articulo;
    }

    public void setArticulo(ArticuloDTO articulo) {
        this.articulo = articulo;
    }

    public DevolucionDTO getDevolucion() {
        return devolucion;
    }

    public void setDevolucion(DevolucionDTO devolucion) {
        this.devolucion = devolucion;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof DetalleDevolucionDTO)) {
            return false;
        }

        DetalleDevolucionDTO detalleDevolucionDTO = (DetalleDevolucionDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, detalleDevolucionDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "DetalleDevolucionDTO{" +
                "id=" + getId() +
                ", cantidad=" + getCantidad() +
                ", precioUnitario=" + getPrecioUnitario() +
                ", montoTotal=" + getMontoTotal() +
                ", articulo=" + getArticulo() +
                ", devolucion=" + getDevolucion() +
                "}";
    }
}

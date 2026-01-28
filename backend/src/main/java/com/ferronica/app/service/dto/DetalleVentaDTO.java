package com.ferronica.app.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

/**
 * A DTO for the {@link com.ferronica.app.domain.DetalleVenta} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class DetalleVentaDTO implements Serializable {

    private Long id;

    @NotNull
    @DecimalMin(value = "0")
    private BigDecimal cantidad;

    @NotNull
    @DecimalMin(value = "0")
    private BigDecimal precioVenta;

    @DecimalMin(value = "0")
    private BigDecimal descuento;

    @NotNull
    @DecimalMin(value = "0")
    private BigDecimal monto;

    private ArticuloDTO articulo;

    private VentaDTO venta;

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

    public BigDecimal getPrecioVenta() {
        return precioVenta;
    }

    public void setPrecioVenta(BigDecimal precioVenta) {
        this.precioVenta = precioVenta;
    }

    public BigDecimal getDescuento() {
        return descuento;
    }

    public void setDescuento(BigDecimal descuento) {
        this.descuento = descuento;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }

    public ArticuloDTO getArticulo() {
        return articulo;
    }

    public void setArticulo(ArticuloDTO articulo) {
        this.articulo = articulo;
    }

    public VentaDTO getVenta() {
        return venta;
    }

    public void setVenta(VentaDTO venta) {
        this.venta = venta;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof DetalleVentaDTO)) {
            return false;
        }

        DetalleVentaDTO detalleVentaDTO = (DetalleVentaDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, detalleVentaDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "DetalleVentaDTO{" +
            "id=" + getId() +
            ", cantidad=" + getCantidad() +
            ", precioVenta=" + getPrecioVenta() +
            ", descuento=" + getDescuento() +
            ", monto=" + getMonto() +
            ", articulo=" + getArticulo() +
            ", venta=" + getVenta() +
            "}";
    }
}

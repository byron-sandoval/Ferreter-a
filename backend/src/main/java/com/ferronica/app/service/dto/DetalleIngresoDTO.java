package com.ferronica.app.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

/**
 * A DTO for the {@link com.ferronica.app.domain.DetalleIngreso} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class DetalleIngresoDTO implements Serializable {

    private Long id;

    @NotNull
    @DecimalMin(value = "0")
    private BigDecimal cantidad;

    @NotNull
    @DecimalMin(value = "0")
    private BigDecimal costoUnitario;

    @NotNull
    @DecimalMin(value = "0")
    private BigDecimal monto;

    private ArticuloDTO articulo;

    private IngresoDTO ingreso;

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

    public BigDecimal getCostoUnitario() {
        return costoUnitario;
    }

    public void setCostoUnitario(BigDecimal costoUnitario) {
        this.costoUnitario = costoUnitario;
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

    public IngresoDTO getIngreso() {
        return ingreso;
    }

    public void setIngreso(IngresoDTO ingreso) {
        this.ingreso = ingreso;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof DetalleIngresoDTO)) {
            return false;
        }

        DetalleIngresoDTO detalleIngresoDTO = (DetalleIngresoDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, detalleIngresoDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "DetalleIngresoDTO{" +
            "id=" + getId() +
            ", cantidad=" + getCantidad() +
            ", costoUnitario=" + getCostoUnitario() +
            ", monto=" + getMonto() +
            ", articulo=" + getArticulo() +
            ", ingreso=" + getIngreso() +
            "}";
    }
}

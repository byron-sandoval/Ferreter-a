package com.ferronica.app.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link com.ferronica.app.domain.Ingreso} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class IngresoDTO implements Serializable {

    private Long id;

    @NotNull
    private Instant fecha;

    @NotNull
    private String noDocumento;

    @NotNull
    private BigDecimal total;

    @Size(max = 255)
    private String observaciones;

    private Boolean activo;

    private VendedorDTO vendedor;

    private ProveedorDTO proveedor;

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

    public String getNoDocumento() {
        return noDocumento;
    }

    public void setNoDocumento(String noDocumento) {
        this.noDocumento = noDocumento;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public VendedorDTO getVendedor() {
        return vendedor;
    }

    public void setVendedor(VendedorDTO vendedor) {
        this.vendedor = vendedor;
    }

    public ProveedorDTO getProveedor() {
        return proveedor;
    }

    public void setProveedor(ProveedorDTO proveedor) {
        this.proveedor = proveedor;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof IngresoDTO)) {
            return false;
        }

        IngresoDTO ingresoDTO = (IngresoDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, ingresoDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "IngresoDTO{" +
            "id=" + getId() +
            ", fecha='" + getFecha() + "'" +
            ", noDocumento='" + getNoDocumento() + "'" +
            ", total=" + getTotal() +
            ", observaciones='" + getObservaciones() + "'" +
            ", activo='" + getActivo() + "'" +
            ", vendedor=" + getVendedor() +
            ", proveedor=" + getProveedor() +
            "}";
    }
}
